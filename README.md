## Descrição

Microsserviço de catálogo de videos (back-end)

## Rodar a aplicação

#### Crie os containers com Docker

```bash
$ docker-compose up -d
```

### Recursos disponibilizados

  
  | Recurso | Verbo | URI | Observação |
  | --- | --- | --- | --- |
  | Categoria | GET | http://localhost:8000/api/categories | Retorna todas as ocorrências de categoria |
  | Categoria | GET | http://localhost:8000/api/categories/<id> | Retorna a ocorrência de categoria solicitada através de id | 
  | Categoria | POST | http://localhost:8000/api/categories | Cria uma nova categoria. Necessário informar, formato *JSON*, parâmetros no body da requisição |
  | Categoria | PUT | http://localhost:8000/api/categories/<id> | Atualizará uma categoria baseado em um id. Necessário informar,  formato *JSON*, parâmetros no body da requisição |
  | Categoria | DELETE | http://localhost:8000/api/categories/<id> | Deleta a ocorrência de categoria conforme id informado |
  | Gênero | GET | http://localhost:8000/api/genders | Retorna todas as ocorrências de gênero |
  | Gênero | GET | http://localhost:8000/api/genders/<id> | Retorna a ocorrência de gênero solicitada através de id | 
  | Gênero | POST | http://localhost:8000/api/genders | Cria um novo gênero. Necessário informar, formato *JSON*, parâmetros no body da requisição |
  | Gênero | PUT | http://localhost:8000/api/genders/<id> | Atualizará um gênero conforme id informado. Necessário informar, formato *JSON*, parâmetros exigidos no body da requisição |
  | Gênero | DELETE | http://localhost:8000/api/genders/<id> | Deletará a ocorrência de gênero conforme id informado |

  | Elenco/Direção | GET | http://localhost:8000/api/cast_members | Retorna todas as ocorrências de participantes de um filme |
  | Elenco/Direção | GET | http://localhost:8000/api/cast_members/<id> | Retorna a ocorrência de participante no filme através de id | 
  | Elenco/Direção | POST | http://localhost:8000/api/cast_members | Cria um novo participante no filme. Necessário informar, formato *JSON*, parâmetros no body da requisição |
  | Elenco/Direção | PUT | http://localhost:8000/api/cast_members/<id> | Atualiza um participante no filme através de um id. Necessário informar, formato *JSON*, parâmetros exigidos no body da requisição |
  | Elenco/Direção | DELETE | http://localhost:8000/api/cast_members/<id> | Deletará um participante no filme conforme id informado |

  - Os atributos de categoria são "name", "description" e "is_active", onde "name" é obrigatório 
  - Os atributos de gênero são "name", e "is_active", onde "name" é obrigatório 
  - Os atributos de cast são "name", e "type", onde "name" e "type" são obrigatórios e "type"
  