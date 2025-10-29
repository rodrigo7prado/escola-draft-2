# 🔧 Guia de Manutenção - Sistema de Certificados

> **Para quem é este guia?** Técnico de TI que fará visitas periódicas (anual/semestral) para manutenção preventiva.

---

## 📋 Checklist de Manutenção Periódica

Recomendação: **Executar uma vez por ano** (início do ano letivo) ou quando houver problemas.

### ✅ Checklist Rápido (30 minutos)

- [ ] Verificar se Docker está atualizado
- [ ] Verificar se sistema está rodando corretamente
- [ ] Verificar espaço em disco
- [ ] Verificar backups automáticos
- [ ] Limpar logs antigos
- [ ] Testar acesso de outros computadores
- [ ] Verificar atualizações disponíveis
- [ ] Documentar estado do sistema

---

## 1. Verificar Docker Desktop

### 1.1 Verificar versão

No computador servidor:
1. Abra Docker Desktop
2. Clique no ícone de configurações (⚙️)
3. Vá em "About"
4. Anote a versão atual

### 1.2 Atualizar Docker (se necessário)

1. Se houver atualização disponível, aparecerá notificação
2. Clique em "Update and restart"
3. Aguarde o processo completar
4. Verifique se sistema volta a funcionar

---

## 2. Verificar Saúde do Sistema

### 2.1 Verificar containers rodando

Abra PowerShell ou CMD e execute:

```bash
docker ps
```

**Deve mostrar 2 containers:**
- `certificados-app` (aplicação Next.js)
- `certificados-db` (PostgreSQL)

**Status deve ser:** `Up X minutes/hours/days`

### 2.2 Verificar logs

Para ver se há erros:

```bash
# Ver logs da aplicação
docker logs certificados-app --tail 50

# Ver logs do banco de dados
docker logs certificados-db --tail 50
```

**O que procurar:**
- ❌ Linhas com "ERROR" ou "FATAL"
- ⚠️ Linhas com "WARNING" (atenção, mas não crítico)
- ✅ Se só tem INFO, está tudo ok

---

## 3. Verificar Espaço em Disco

### 3.1 Espaço geral

1. Abra "Este Computador"
2. Verifique o disco C:
3. **Ideal:** Mínimo 20GB livres
4. **Crítico:** Menos de 5GB livres

### 3.2 Espaço usado pelo Docker

No PowerShell:

```bash
docker system df
```

Mostra quanto espaço o Docker está usando.

### 3.3 Limpar espaço (se necessário)

**Limpar dados antigos do Docker:**

```bash
docker system prune -a
```

⚠️ **Atenção:** Isto remove imagens e caches não utilizados. Os dados do sistema não são afetados.

---

## 4. Gerenciar Backups

### 4.1 Verificar backups automáticos

1. Vá em `C:\Sistemas\sistema-certificados\backups`
2. Verifique se há pastas com datas recentes
3. **Deve haver:** Uma pasta por dia dos últimos 30 dias

### 4.2 Testar restauração de backup

**Execute este teste uma vez por ano:**

1. Anote o estado atual do sistema (tire prints)
2. Siga as instruções de restauração no **EMERGENCIA.md**
3. Restaure um backup de ontem
4. Verifique se funcionou
5. Restaure o backup de hoje (volta ao normal)

✅ **Se funcionou, backups estão ok!**

### 4.3 Backup manual completo

**Para criar backup completo do sistema:**

1. Pare o sistema: `parar-sistema.bat`
2. Copie a pasta `C:\Sistemas\sistema-certificados` inteira
3. Cole em local seguro (HD externo, nuvem, etc)
4. Renomeie para incluir data: `certificados-backup-2024-01-15`
5. Reinicie o sistema: `iniciar-sistema.bat`

### 4.4 Configurar backup externo

**Recomendação:** Copiar backups para HD externo ou rede semanalmente

Crie um script batch `backup-externo.bat`:

```batch
@echo off
echo Copiando backups...
robocopy "C:\Sistemas\sistema-certificados\backups" "D:\BackupsCertificados" /MIR /R:3 /W:5
echo Backup concluído!
pause
```

Agende no Agendador de Tarefas do Windows para rodar toda segunda-feira.

---

## 5. Limpar Dados Antigos

### 5.1 Limpar logs antigos

Logs podem ocupar muito espaço:

```bash
# Ver tamanho dos logs
docker logs certificados-app --tail 0 2>&1 | wc -l

# Limpar logs (aplicação)
docker logs certificados-app --tail 0 > nul 2>&1

# Limpar logs (banco)
docker logs certificados-db --tail 0 > nul 2>&1
```

### 5.2 Limpar backups muito antigos

Manualmente:
1. Vá em `C:\Sistemas\sistema-certificados\backups`
2. Apague pastas com mais de 90 dias
3. Mantenha pelo menos os últimos 30 dias

---

## 6. Atualizar Sistema

### 6.1 Verificar versão atual

No sistema, no rodapé da página, verá:
```
Versão: 1.0.0
```

### 6.2 Atualizar para nova versão

Quando houver atualização:

1. **Backup primeiro!** (ver seção 4.3)
2. Pare o sistema: `parar-sistema.bat`
3. Baixe a nova versão (você receberá um arquivo ZIP)
4. Extraia o arquivo
5. Copie apenas os seguintes arquivos/pastas da nova versão:
   - `.next/` (pasta)
   - `package.json`
   - `docker-compose.yml` (se houver)
6. Cole em `C:\Sistemas\sistema-certificados` (sobrescrever)
7. Inicie o sistema: `iniciar-sistema.bat`
8. Teste se funcionou
9. Verifique a nova versão no rodapé

### 6.3 Atualizar dependências

Se solicitado:

```bash
cd C:\Sistemas\sistema-certificados
docker-compose down
docker-compose pull
docker-compose up -d
```

---

## 7. Otimizar Performance

### 7.1 Otimizar banco de dados

Execute uma vez por ano:

```bash
docker exec -it certificados-db psql -U postgres -d certificados -c "VACUUM ANALYZE;"
```

Isso limpa e otimiza o banco de dados.

### 7.2 Verificar índices

```bash
docker exec -it certificados-db psql -U postgres -d certificados -c "\di"
```

Lista os índices. Se houver muitos dados e estiver lento, pode precisar criar índices adicionais (consultar desenvolvedor).

---

## 8. Segurança

### 8.1 Atualizar senha do banco

**Importante:** Fazer na instalação inicial e anualmente

```bash
docker exec -it certificados-db psql -U postgres -c "ALTER USER postgres PASSWORD 'NOVA_SENHA_AQUI';"
```

Depois, atualize em `.env`:
```
DATABASE_PASSWORD=NOVA_SENHA_AQUI
```

Reinicie o sistema.

### 8.2 Firewall

Verifique que apenas a porta 3000 está aberta para rede local:

1. Painel de Controle → Firewall
2. Configurações avançadas → Regras de entrada
3. Procure pela regra "Sistema Certificados"
4. Verifique que está ativa

### 8.3 Antivírus

Configure exceções para:
- `C:\Sistemas\sistema-certificados\*`
- Docker Desktop

Isso evita lentidão causada por scanning constante.

---

## 9. Monitoramento

### 9.1 Verificar uso de recursos

Abra Gerenciador de Tarefas (Ctrl+Shift+Esc):

**Docker Desktop deve usar:**
- CPU: < 10% em idle, até 50% em uso
- RAM: 500MB - 2GB
- Disco: Baixo em idle

**Se estiver usando muito:**
- Pode ter muitos containers rodando
- Execute `docker system prune`

### 9.2 Logs de acesso

Ver quem acessou recentemente:

```bash
docker logs certificados-app | grep "GET" | tail -50
```

### 9.3 Estatísticas do banco

```bash
docker exec -it certificados-db psql -U postgres -d certificados -c "\dt+"
```

Mostra tamanho das tabelas.

---

## 10. Documentação

### 10.1 Registrar alterações

Mantenha um arquivo `HISTORICO.txt` em:
```
C:\Sistemas\sistema-certificados\HISTORICO.txt
```

Formato:
```
[2024-01-15] - Manutenção anual
- Docker atualizado para versão 4.26
- Backup testado com sucesso
- Logs limpos
- Sistema funcionando normalmente
- Responsável: João Silva

[2024-06-20] - Atualização sistema
- Sistema atualizado de 1.0.0 para 1.1.0
- Nova funcionalidade de relatórios
- Responsável: Maria Santos
```

### 10.2 Inventário

Documente:
- IP do servidor: _______________
- Nome do servidor: _______________
- Versão do Docker: _______________
- Versão do sistema: _______________
- Última manutenção: _______________
- Próxima manutenção agendada: _______________
- Responsável técnico: _______________
- Telefone suporte: _______________

---

## 11. Checklist de Férias/Final de Ano

Antes de férias longas:

- [ ] Backup completo manual (HD externo)
- [ ] Testar restauração de backup
- [ ] Atualizar sistema para última versão
- [ ] Limpar logs
- [ ] Verificar espaço em disco (garantir 20GB+ livres)
- [ ] Documentar estado atual
- [ ] Criar ponto de restauração do Windows (servidor)
- [ ] Deixar manual impresso de emergência
- [ ] Informar alguém de confiança sobre localização dos backups

---

## 12. Problemas Conhecidos

### Problema 1: Container não inicia após atualização Windows

**Solução:**
```bash
docker-compose down
docker-compose up -d
```

### Problema 2: Banco de dados corrompido

**Solução:**
Restaurar último backup bom (ver EMERGENCIA.md seção 8)

### Problema 3: Porta 3000 em uso

**Solução:**
```bash
netstat -ano | findstr :3000
taskkill /PID [número_do_pid] /F
```

---

## 📞 Suporte Técnico

**Desenvolvedor do sistema:**
- Nome: [A preencher]
- Email: [A preencher]
- Telefone: [A preencher]

**Suporte Docker:**
- Documentação: https://docs.docker.com
- Fórum: https://forums.docker.com

**PostgreSQL:**
- Documentação: https://www.postgresql.org/docs/

---

## 🔒 Dados Sensíveis

Localização de informações sensíveis:

| Item | Localização |
|------|-------------|
| Senha do banco | `C:\Sistemas\sistema-certificados\.env` |
| Backups | `C:\Sistemas\sistema-certificados\backups` |
| Logs | Docker containers (voláteis) |
| Dados do banco | Volume Docker `certificados-db-data` |

**⚠️ Nunca compartilhe estas informações publicamente!**

---

**Última atualização:** 2025-01-29
**Próxima revisão recomendada:** Janeiro 2026
