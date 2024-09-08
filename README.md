# KeyMagnet
This is the repository for the paper NDSS 2025 "The Skeleton Keys: A Large Scale Analysis of Credential Leakage in Mini-apps". The main content of different phases are illustrated as follows.

## DocumentationAnalysis

`DocumentationAnalysis` is used for extracting credential-use semantics of the mini-app server-side, and build credential-use semantic graph (CSG).

start documentation analysis and build CSG:
```shell
python3 extractor_for_all.py
```

## MPStaticAnalysis
`MPStaticAnalysis` performs a fine-grained data flow analysis based on [JAW](https://github.com/SoheilKhodayari/JAW) to track network data and extract behaviors in mini-apps.

start static analysis and build the client-side behavior graph (CBG):
```shell
python mpRunner.py
```     

## MPDynamicAnalysis
`MPDynamicAnalysis` is designed for webview-based mini-apps and simulate user interactions to explore the webview-based mini-apps based on [Android UI Automator](https://developer.android.com/training/testing/other-components/ui-automator). 

start dynamic analysis:
```shell
python3 handle_miniapp.py
```

build client-side behavior graph (CBG)
```shell
python3 build_CBG.py
```

## SemanticMatching
`SemanticMatching` is used to perform semantic-based similarity analysis between the CSG and CBG. 

start semantic matching:
```shell
python3 mpMatcher.py
```

