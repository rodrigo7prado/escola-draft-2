# 🆘 Guia de Emergência - Soluções Rápidas

> **Use este guia quando algo der errado!**
> Soluções simples e rápidas para 99% dos problemas.

---

## 📋 Índice Rápido

1. [Sistema não abre](#1-sistema-não-abre)
2. [Sistema está muito lento](#2-sistema-está-muito-lento)
3. [Dados sumiram](#3-dados-sumiram)
4. [Sistema travou](#4-sistema-travou)
5. [Não consigo fazer upload](#5-não-consigo-fazer-upload)
6. [Outros computadores não conseguem acessar](#6-outros-computadores-não-conseguem-acessar)
7. [Erro "Quota Exceeded"](#7-erro-quota-exceeded)
8. [Restaurar backup](#8-restaurar-backup)

---

## 1. Sistema não abre

### 🔴 Problema
Quando acesso o endereço do sistema no navegador, não carrega nada ou dá erro.

### ✅ Soluções (tente nesta ordem)

#### Solução 1.1: Verificar se servidor está ligado
- Vá até o computador servidor
- Verifique se está ligado e funcionando

#### Solução 1.2: Verificar Docker
- No computador servidor, olhe a bandeja do sistema (canto inferior direito)
- Procure o ícone da "baleia" (Docker)
- **Se não estiver lá:**
  1. Procure "Docker Desktop" no menu Iniciar
  2. Clique para abrir
  3. Aguarde 1-2 minutos
  4. Tente acessar o sistema novamente

#### Solução 1.3: Reiniciar o sistema
No computador servidor:
1. Abra a pasta do sistema: `C:\Sistemas\sistema-certificados`
2. Duplo-clique em **`reiniciar-sistema.bat`**
3. Aguarde 2 minutos
4. Tente acessar novamente

#### Solução 1.4: Reiniciar o computador servidor
- Reinicie o computador servidor
- Aguarde 3-5 minutos após ligar
- Tente acessar novamente

### 🔴 Ainda não funciona?
→ Ver [Solução 6](#6-outros-computadores-não-conseguem-acessar)

---

## 2. Sistema está muito lento

### 🔴 Problema
O sistema abre mas está demorando muito para responder.

### ✅ Soluções

#### Solução 2.1: Recarregar a página
- Pressione **F5** no teclado
- Ou clique no botão de recarregar do navegador

#### Solução 2.2: Fechar outras abas
- Feche outras abas/janelas do navegador
- Deixe apenas a aba do sistema aberta

#### Solução 2.3: Verificar rede
- Muitos dispositivos usando a rede ao mesmo tempo?
- Alguém baixando arquivos grandes?
- Aguarde alguns minutos e tente novamente

#### Solução 2.4: Verificar servidor
No computador servidor:
- Está rodando muitos programas ao mesmo tempo?
- Tente fechar programas desnecessários
- Verifique se não há downloads/updates em andamento

---

## 3. Dados sumiram

### 🔴 Problema
Os dados que eu importei não aparecem mais.

### ✅ Soluções

#### Solução 3.1: Recarregar a página
- Pressione **F5** no teclado
- Os dados devem reaparecer

#### Solução 3.2: Verificar se não foram excluídos
- Verifique se alguém não excluiu por engano
- Clique no resumo de "arquivos carregados"
- Veja se os arquivos estão listados

#### Solução 3.3: Restaurar backup
→ Ver [Solução 8](#8-restaurar-backup)

---

## 4. Sistema travou

### 🔴 Problema
A tela do sistema não responde, botões não funcionam.

### ✅ Soluções

#### Solução 4.1: Recarregar a página
- Pressione **F5** no teclado
- Se não responder, pressione **Ctrl + F5** (recarrega forçado)

#### Solução 4.2: Fechar e abrir navegador
- Feche completamente o navegador
- Abra novamente
- Acesse o sistema

#### Solução 4.3: Reiniciar sistema
No computador servidor:
1. Vá em `C:\Sistemas\sistema-certificados`
2. Duplo-clique em **`reiniciar-sistema.bat`**
3. Aguarde 2 minutos
4. Tente acessar novamente

---

## 5. Não consigo fazer upload

### 🔴 Problema
Quando tento importar arquivo CSV, não funciona ou dá erro.

### ✅ Soluções

#### Solução 5.1: Verificar tipo de arquivo
- O arquivo tem extensão `.csv`?
- Não pode ser `.xlsx`, `.xls` ou `.txt`

#### Solução 5.2: Fechar arquivo no Excel
- Se o arquivo está aberto no Excel, feche primeiro
- Tente fazer o upload novamente

#### Solução 5.3: Arquivo muito grande
- Se o arquivo tem mais de 100.000 linhas, pode demorar
- Aguarde alguns minutos
- Não feche a página durante o upload

#### Solução 5.4: Tentar um arquivo por vez
- Ao invés de selecionar vários, tente um por um
- Aguarde cada upload completar antes do próximo

---

## 6. Outros computadores não conseguem acessar

### 🔴 Problema
Do computador servidor funciona, mas de outros computadores não.

### ✅ Soluções

#### Solução 6.1: Verificar endereço
- Tem certeza que está digitando o endereço correto?
- Exemplo: `http://192.168.1.100:3000` (não esqueça `:3000`)
- Não use `https://`, use apenas `http://`

#### Solução 6.2: Verificar se estão na mesma rede
- O outro computador está conectado à rede da escola?
- Não está usando internet móvel ou outra rede Wi-Fi?

#### Solução 6.3: Testar com IP ao invés de nome
Se está usando nome (ex: `http://servidor-escola:3000`):
- Tente usar o IP direto: `http://192.168.1.100:3000`

#### Solução 6.4: Verificar firewall
No computador servidor:
1. Menu Iniciar → digite "Firewall"
2. Abra "Firewall do Windows Defender"
3. Clique em "Permitir um aplicativo..."
4. Procure por "Docker" na lista
5. Marque as caixas "Privado" e "Público"
6. Clique OK

---

## 7. Erro "Quota Exceeded"

### 🔴 Problema
Mensagem de erro aparece ao tentar carregar muitos arquivos.

### ✅ Soluções

#### Solução 7.1: Aguardar implementação do banco de dados
- Este erro acontece porque o sistema está usando armazenamento temporário
- A versão com banco de dados PostgreSQL resolverá definitivamente
- **Solução temporária:** Carregue menos arquivos por vez

#### Solução 7.2: Limpar dados antigos
- Remova arquivos/períodos que não está usando no momento
- Após processar, pode remover e adicionar novos depois

---

## 8. Restaurar backup

### 🔴 Situação
Preciso voltar os dados para como estavam antes.

### ✅ Passos

#### 8.1: Localizar arquivos de backup
No computador servidor:
1. Vá em `C:\Sistemas\sistema-certificados\backups`
2. Você verá pastas com datas, ex: `backup-2023-12-15`
3. Escolha a data que quer restaurar

#### 8.2: Parar o sistema
1. Vá em `C:\Sistemas\sistema-certificados`
2. Duplo-clique em **`parar-sistema.bat`**
3. Aguarde aparecer "Sistema parado"

#### 8.3: Restaurar
1. Na pasta de backup escolhida, copie o arquivo `database.sql`
2. Cole em `C:\Sistemas\sistema-certificados\database`
3. Substitua o arquivo quando perguntar

#### 8.4: Reiniciar
1. Duplo-clique em **`iniciar-sistema.bat`**
2. Aguarde 2 minutos
3. Acesse o sistema

✅ **Dados restaurados!**

---

## 📞 Nada Funcionou?

Se tentou todas as soluções acima e ainda não funcionou:

### Opção 1: Reiniciar tudo do zero (solução mais drástica)
1. Reiniciar o computador servidor
2. Aguardar 5 minutos
3. Tentar acessar novamente

### Opção 2: Contatar suporte
- Anote exatamente qual erro aparece na tela
- Tire uma foto/print da tela
- Entre em contato com o responsável de TI

### Opção 3: Reinstalar (último recurso)
- Siga os passos no arquivo **INSTALACAO.md**
- Seus dados podem ser recuperados do backup

---

## 🔧 Comandos Úteis

### Parar o sistema
```
C:\Sistemas\sistema-certificados\parar-sistema.bat
```

### Iniciar o sistema
```
C:\Sistemas\sistema-certificados\iniciar-sistema.bat
```

### Reiniciar o sistema
```
C:\Sistemas\sistema-certificados\reiniciar-sistema.bat
```

### Ver logs (para técnicos)
```
C:\Sistemas\sistema-certificados\ver-logs.bat
```

---

## ⚠️ O QUE NÃO FAZER

❌ **NÃO apague** a pasta do sistema
❌ **NÃO edite** arquivos dentro da pasta (a não ser que saiba o que está fazendo)
❌ **NÃO desligue** o servidor à força (use "Desligar" do Windows normalmente)
❌ **NÃO use** `localhost` em computadores que não são o servidor

---

**Última atualização:** 2025-01-29

> 💡 **Dica:** Imprima esta página e deixe perto do computador servidor!
