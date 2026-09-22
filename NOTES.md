# Notes

Podemos criar um MONO_REPO (Único Repositório) utilizando diretórios *app/* e *server/*

No arquivo *package.json* inserimos:

```json
{
    "workspaces": [ "app/", "server/" ]
}
```

Assim, o *npm* consegue instalar todas as dependências com *npm install*