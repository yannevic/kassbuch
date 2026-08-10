# 📔 KassBuch

Diário pessoal de desktop com visual de livro aberto — feito pra escrever em alemão, com tradução instantânea ao passar o mouse sobre qualquer palavra.

## ✨ Funcionalidades

- **Visual de livro real**: duas páginas visíveis lado a lado (esquerda/direita), com navegação de spread em spread, como um livro físico
- **Tradução por hover**: passe o mouse sobre qualquer palavra do texto e veja a tradução instantaneamente
- **100% local**: sem conta, sem login, sem sincronização — todos os dados ficam no seu computador
- **Backup manual**: exporte e importe suas entradas em `.json` quando quiser
- **Auto-update**: o app se atualiza sozinho a cada nova versão publicada

## 🛠️ Stack

- [Electron](https://www.electronjs.org/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) para armazenamento local
- [DeepL API](https://www.deepl.com/pro-api) para tradução (com fallback automático)

## 🚀 Rodando localmente

```bash
npm install
npm run dev
```

## 📦 Status

Em desenvolvimento ativo. Próximos passos: página de rosto, calendário visual anual, mecânica de tradução por hover e backup.

## 📄 Licença

Projeto pessoal, sem licença de uso público definida.
