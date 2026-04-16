# E-commerce Platzi Fake Store — Agência [ASMPK]

Aplicação web de e-commerce integrada à Platzi Fake Store API,
desenvolvida como projeto final da UC07 - SENAC/RN.

## Status do projeto
Em desenvolvimento · Sprint 1 · 13/04/2026

## Equipe
- **Líder Técnico:** Álamo Henrique
<<<<<<< HEAD
- **Dev 1 (Vitrine):** [nome]
- **Dev 2 (Detalhe & Componentes):** [nome]
- **Dev 3 (CRUD Admin):** [nome]
- **Dev 4 (Autenticação):** [nome]
=======
- **Dev 1 (Vitrine):** [Samuel Renildo]
- **Dev 2 (Detalhe & Componentes):** [Maria Clara]
- **Dev 3 (CRUD Admin):** [Pablo Alejandro]
- **Dev 4 (Autenticação):** [Kauã Victor]
>>>>>>> 7a812de32182babff1844db543a4836ab6feeaad

## Tecnologias
- HTML5 semântico
- CSS3 (Flexbox, Grid, Media Queries)
- JavaScript ES6+ (sem frameworks)
- Fetch API nativa
- localStorage (persistência do JWT)
- Git + GitHub
- GitHub Pages (deploy)

## Arquitetura
Aplicação em duas camadas: `/js/api` (chamadas HTTP) e `/js/ui`
(manipulação de DOM).

## Endpoints implementados
| Método | Endpoint | Responsável | Status |
|--------|----------|-------------|--------|
| GET | /products | Dev 1 | 🔴 |
| GET | /products?offset=&limit= | Dev 1 | 🔴 |
| GET | /products?categoryId= | Dev 1 | 🔴 |
| GET | /products?title= | Dev 1 | 🔴 |
| GET | /products?price_min=&price_max= | Dev 1 | 🔴 |
| GET | /products/:id | Dev 2 | 🔴 |
| GET | /products/:id/related | Dev 2 | 🔴 |
| GET | /categories | Dev 1 | 🔴 |
| POST | /products | Dev 3 | 🔴 |
| PUT | /products/:id | Dev 3 | 🔴 |
| DELETE | /products/:id | Dev 3 | 🔴 |
| POST | /users | Dev 4 | 🔴 |
| POST | /users/is-available | Dev 4 | 🔴 |
| POST | /auth/login | Dev 4 | 🔴 |
| GET | /auth/profile | Dev 4 | 🔴 |

Legenda: 🟢 concluído · 🟡 em andamento · 🔴 não iniciado


## URL de produção
https://[usuario].github.io/[repo]

## Screenshots
(preencher ao final de cada sprint)

