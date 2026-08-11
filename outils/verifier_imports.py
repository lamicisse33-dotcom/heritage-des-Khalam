#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vérifie qu'aucun module n'utilise un nom exporté par un autre sans l'importer.

Ce défaut est invisible pour les bancs d'essai qui concatènent les modules
dans une seule portée : tout se voit, donc rien ne manque. Il ne se révèle
qu'à l'exécution réelle, et parfois seulement sur une branche rare — le cas
de `saveGame` appelée dans `checkAchievements()`, qui ne s'exécute qu'au
déblocage d'un haut fait.

À lancer après toute modification des imports.
"""
import io, re, sys, glob, os

DOSSIER = os.path.dirname(os.path.abspath(__file__))
IGNORES = {'sw.js'}

# Noms fournis par le navigateur : jamais à importer.
GLOBAUX = {
    'window', 'document', 'navigator', 'location', 'console', 'localStorage',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'fetch',
    'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date',
    'Promise', 'Map', 'Set', 'Error', 'RegExp', 'Audio', 'Image', 'Event',
    'CustomEvent', 'MutationObserver', 'requestAnimationFrame', 'caches',
    'SpeechSynthesisUtterance', 'speechSynthesis', 'AudioContext', 'self',
}


def lire(p):
    return io.open(p, encoding='utf-8').read()


def sans_commentaires_ni_chaines(src):
    """Retire commentaires et littéraux, pour ne garder que du code."""
    src = re.sub(r'/\*[\s\S]*?\*/', ' ', src)
    src = re.sub(r'(?<!:)//[^\n]*', ' ', src)
    src = re.sub(r'`(?:[^`\\]|\\.)*`', ' `` ', src)
    src = re.sub(r"'(?:[^'\\\n]|\\.)*'", " '' ", src)
    src = re.sub(r'"(?:[^"\\\n]|\\.)*"', ' "" ', src)
    return src


def exportes(src):
    noms = set(re.findall(
        r'^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)',
        src, re.M))
    for bloc in re.findall(r'^export\s*\{([^}]*)\}', src, re.M):
        for n in bloc.split(','):
            n = n.strip().split(' as ')[-1].strip()
            if n:
                noms.add(n)
    return noms


def importes(src):
    noms = set()
    for bloc in re.findall(r"import\s*\{([^}]*)\}\s*from", src):
        for n in bloc.replace('\n', ' ').split(','):
            n = n.strip().split(' as ')[-1].strip()
            if n:
                noms.add(n)
    noms |= set(re.findall(r"import\s+([A-Za-z_$][\w$]*)\s+from", src))
    return noms


def declares(src):
    """Noms définis localement, au niveau module ou dans une fonction."""
    d = set()
    d |= set(re.findall(r'\b(?:function|class)\s+([A-Za-z_$][\w$]*)', src))
    d |= set(re.findall(r'\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)', src))
    # déstructurations : const { a, b } = ...
    for bloc in re.findall(r'\b(?:const|let|var)\s*\{([^}]*)\}\s*=', src):
        for n in bloc.split(','):
            n = n.strip().split(':')[-1].strip()
            if n:
                d.add(n)
    # paramètres de fonction
    for bloc in re.findall(r'function\s*[A-Za-z_$\w]*\s*\(([^)]*)\)', src):
        for n in bloc.split(','):
            n = re.sub(r'[=.].*', '', n).strip().strip('{}[] ')
            if re.match(r'^[A-Za-z_$][\w$]*$', n):
                d.add(n)
    for bloc in re.findall(r'\(([^)]*)\)\s*=>', src):
        for n in bloc.split(','):
            n = re.sub(r'[=.].*', '', n).strip().strip('{}[] ')
            if re.match(r'^[A-Za-z_$][\w$]*$', n):
                d.add(n)
    d |= set(re.findall(r'([A-Za-z_$][\w$]*)\s*=>', src))
    return d


def main():
    fichiers = [f for f in sorted(glob.glob(os.path.join(DOSSIER, '*.js')))
                if os.path.basename(f) not in IGNORES]
    sources = {os.path.basename(f): lire(f) for f in fichiers}

    # Tous les noms exportés, avec leur module d'origine.
    origine = {}
    for nom, src in sources.items():
        for e in exportes(src):
            origine[e] = nom

    fautes = []
    for nom, src in sources.items():
        code = sans_commentaires_ni_chaines(src)
        connus = importes(src) | declares(code) | GLOBAUX | exportes(src)
        utilises = set(re.findall(r'(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(', code))
        for u in sorted(utilises):
            if u in connus:
                continue
            if u in origine and origine[u] != nom:
                fautes.append((nom, u, origine[u]))

    print("Modules vérifiés : %d" % len(sources))
    if fautes:
        for f, u, o in fautes:
            print("  !! %s appelle '%s' sans l'importer (défini dans %s)" % (f, u, o))
        print("\n%d import(s) manquant(s)." % len(fautes))
        sys.exit(1)

    print("Aucun appel à une fonction non importée.")


if __name__ == '__main__':
    main()
