# erros.md — Rastreamento completo de erros (MHIRA Cuidador)

> Atualizado em: 15/10/2025 - 14:45
> **STATUS CRÍTICO**: Erro 400 Bad Request persiste no navegador apesar de testes curl funcionarem

## 1) Portas ocupadas (80 e 3000)
- Sintoma: `Bind for 0.0.0.0:80 failed` e conflitos na 3000.
- Causa: Traefik ocupando 80/443 e Easypanel ocupando 3000.
- Ação: Parar serviços conflitantes e usar compose simples com `frontend:8080`, `backend:3001`.
- Status: Resolvido.

## 2) Backend não usava código local / migrations ausentes
- Sintoma: container sem `src/migrations`, banco incompleto.
- Causa: Dockerfile original do MHIRA usa imagem pronta.
- Ação: (Atual) usando imagem oficial; implementação custom ficará em etapa posterior.
- Status: Adiado (planejado para build local futuro).

## 3) Frontend chamando dev-api.mhira.net/graphql (405/ERR_NAME_NOT_RESOLVED)
- Sintoma: Erros de rede para domínio externo.
- Causa: Frontend padrão aponta para endpoint público.
- Ação: Dockerfile custom substitui para `./graphql` e Nginx faz proxy.
- Status: Resolvido (build custom aplicado).

## 4) “Tenant not found”
- Sintoma: Erro GraphQL no login.
- Causa: Tabela `tenant` vazia.
- Ação: `INSERT INTO tenant (1,'default','MHIRA Cuidador',...)` e forçar `X-Tenant-Id: default` no Nginx.
- Status: Resolvido.

## 5) Falta de tabelas (ex.: `relation "user" does not exist`)
- Sintoma: Erro ao logar após corrigir tenant.
- Causa: Schema inicial incompleto.
- Ação: Habilitado `TYPEORM_SYNCHRONIZE=true` para criação automática; backend recriou tabelas.
- Status: Resolvido.

## 6) 502 Bad Gateway no `/graphql`
- Sintoma: 502 no frontend.
- Causa: Proxy apontando para serviço não acessível durante reinícios do backend e DNS interno.
- Ação: Ajustado proxy para `http://dockerhost:3001/graphql` + `extra_hosts: dockerhost:172.17.0.1`.
- Status: Em observação (normaliza após backend estabilizar).

## 7) Service Worker MIME `text/html`
- Sintoma: `ngsw-worker.js` com MIME incorreto.
- Causa: SW do Angular não necessário neste cenário; Nginx serve como texto.
- Ação: Sem impacto funcional; pode ser desabilitado em build PWA.
- Status: Baixa prioridade.

## 8) Erro TypeORM “No connection options were found”
- Sintoma: Backend caiu logo após subir.
- Causa: Variáveis `TYPEORM_*` ausentes no compose simples.
- Ação: Adicionadas todas as `TYPEORM_*` esperadas pelo MHIRA.
- Status: Resolvido.

## 9) Mongoose URI indefinida
- Sintoma: `The uri parameter to openUri() must be a string`.
- Causa: Variável `MONGODB_CONNECTION_STRING` faltando.
- Ação: Definida `mongodb://mongo:27017/questionnaireDB` no compose simples.
- Status: Resolvido.

## 10) Erro de migração em `tenant.subdomain` (23502)
- Sintoma: `column "subdomain" ... contains null values`.
- Causa: Execução de migrações sobre tabela existente sem dados válidos.
- Ação: Reset do schema `public` e re-subida com `TYPEORM_MIGRATIONS_RUN=false` e `SYNCHRONIZE=true`.
- Status: Resolvido.

## 11) Conectividade frontend → backend
- Sintoma: `wget: bad address mhira-backend:3000` de dentro do frontend.
- Causa: DNS do serviço não resolvendo no ambiente simples.
- Ação: Proxy via host gateway `dockerhost:3001` com `extra_hosts`.
- Status: Resolvido.

## 12) LLM / Ollama
- Sintoma: Falhas esporádicas de teste `node-fetch`/`fetch` em Node.
- Causa: Ambiente Node sem fetch nativo.
- Ação: Uso de `curl` para testes; integração de backend será feita após módulos.
- Status: Aguardando implementação de módulos de IA.

---

## 13) ERRO CRÍTICO: 400 Bad Request no navegador (PERSISTENTE)
- **Sintoma**: `POST http://localhost:8080/graphql 400 (Bad Request)` no console do navegador
- **Detalhes técnicos**:
  - Erro ocorre especificamente no navegador (Chrome, Safari, Firefox)
  - `curl` funciona perfeitamente: `HTTP Status: 200`
  - Stack trace: `main.bf891c601d6ed8bf.js:434` (Angular minificado)
  - Network error: `Http failure response for http://localhost:8080/graphql: 400 Bad Request`
- **Tentativas de correção realizadas**:
  1. ✅ Backend de teste com schema GraphQL completo
  2. ✅ CORS configurado no backend
  3. ✅ Proxy Nginx corrigido (dockerhost → nome do serviço)
  4. ✅ Headers corretos: `X-Tenant-Id: default`
  5. ✅ Service Worker MIME type corrigido
  6. ✅ DNS interno resolvido
- **Causa suspeita**: 
  - Frontend MHIRA pode estar enviando requisições com formato diferente do esperado
  - Possível incompatibilidade entre versão do frontend e backend
  - Headers específicos do Angular não sendo tratados corretamente
- **Status**: ❌ **CRÍTICO - NÃO RESOLVIDO**

## 14) Backend oficial MHIRA com bug de migração
- **Sintoma**: `QueryFailedError: relation "tenant" already exists`
- **Causa**: Conflito interno no TypeORM entre `SYNCHRONIZE=true` e migrações
- **Detalhes**: 
  - Backend oficial `mhiraproject/mhira-backend:latest` tem bug interno
  - Mesmo com `TYPEORM_MIGRATIONS_RUN=false` o erro persiste
  - Logs mostram: `UnhandledPromiseRejectionWarning`
- **Solução temporária**: Usar backend de teste customizado
- **Status**: ❌ **BUG NO BACKEND OFICIAL**

## 15) Diferença entre curl e navegador
- **Sintoma**: curl funciona, navegador falha com 400
- **Possíveis causas**:
  - User-Agent diferente
  - Headers de navegador (Accept, Accept-Encoding, etc.)
  - Cookies/sessões
  - Preflight CORS
  - Content-Type específico do Angular
- **Status**: 🔍 **INVESTIGAÇÃO NECESSÁRIA**

---

## CONFIGURAÇÃO ATUAL (Funcionando via curl)

### Arquivos ativos:
- **Compose**: `docker-compose-final.yml`
- **Backend**: Backend de teste customizado (`test-backend.js`)
- **Frontend**: MHIRA oficial com proxy customizado
- **Proxy**: `mhira-frontend/nginx/nginx.conf`

### Testes funcionais via curl:
```bash
# Frontend
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080
# Resultado: HTTP Status: 200

# Backend direto
curl -X POST -H "Content-Type: application/json" -d '{"query":"query { hello }"}' http://localhost:3001/graphql
# Resultado: {"data":{"hello":"Hello MHIRA!"}}

# Login via frontend
curl -X POST -H "Content-Type: application/json" -H "X-Tenant-Id: default" \
  -d '{"query":"mutation { login(username: \"superadmin\", password: \"superadmin\") { accessToken success } }"}' \
  http://localhost:8080/graphql
# Resultado: {"data":{"login":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token","success":true}}}
```

### Erro no navegador:
```
POST http://localhost:8080/graphql 400 (Bad Request)
ERROR Error: Network error: Http failure response for http://localhost:8080/graphql: 400 Bad Request
```

---

## INVESTIGAÇÃO NECESSÁRIA PARA IA

### 1. Análise de requisições do navegador:
- Capturar requisição real do navegador (DevTools → Network)
- Comparar headers enviados pelo navegador vs curl
- Verificar payload exato da requisição GraphQL

### 2. Análise do backend de teste:
- Verificar se está tratando todos os tipos de requisição
- Analisar logs detalhados do backend quando navegador faz requisição
- Testar com diferentes User-Agents

### 3. Análise do proxy Nginx:
- Verificar se está repassando todos os headers corretamente
- Analisar logs do Nginx durante requisição do navegador
- Testar com diferentes configurações de proxy

### 4. Análise do frontend MHIRA:
- Verificar versão do Angular e dependências
- Analisar como o Angular está construindo as requisições GraphQL
- Verificar se há interceptors ou middlewares customizados

### 5. Soluções alternativas:
- Usar backend oficial MHIRA com correção de migração
- Implementar backend Node.js/Express completo
- Usar proxy reverso diferente (Traefik, Caddy)
- Modificar frontend para usar endpoint diferente

---

## Pendentes atuais
- [ ] ❌ **CRÍTICO**: Resolver erro 400 Bad Request no navegador
- [ ] Investigar diferença entre curl e navegador
- [ ] Corrigir bug de migração do backend oficial MHIRA
- [ ] Estabilizar login end-to-end no navegador real
- [ ] Desabilitar service worker do Angular (opcional)
- [ ] Implementar backend do diário e serviços de IA

## Anexos úteis
- Compose atual: `docker-compose-final.yml`
- Backend de teste: `test-backend.js`
- Proxy Nginx: `mhira-frontend/nginx/nginx.conf`
- Logs: `docker logs mhira-docker-test-backend-1` e `docker logs mhira-docker-mhira-frontend-1`

