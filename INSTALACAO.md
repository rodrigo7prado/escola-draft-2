# 📦 Guia de Instalação - Sistema de Certificados

> **Para quem é este guia?** Técnico de TI ou pessoa responsável pela configuração INICIAL do sistema (uma única vez).

---

## ⚠️ Importante

- Esta instalação é feita **UMA ÚNICA VEZ** no computador que será o "servidor"
- Tempo estimado: **30 minutos**
- Após a instalação, o sistema funciona sozinho
- Usuários finais **NÃO precisam** fazer esta instalação

---

## 📋 Pré-requisitos

### Computador "Servidor" (onde o sistema ficará)

- **Sistema Operacional:** Windows 10 ou 11
- **Memória RAM:** Mínimo 4GB (recomendado 8GB)
- **Espaço em disco:** 5GB livres
- **Rede:** Conectado à rede da escola (cabo ou Wi-Fi)
- **Observação:** Este computador pode ser usado para outras tarefas, não precisa ser dedicado

### O que você precisa ter/fazer:

1. ✅ Acesso de administrador no computador
2. ✅ Internet (só durante a instalação)
3. ✅ IP ou nome do computador na rede (ex: `192.168.1.100` ou `SERVIDOR-ESCOLA`)

---

## 🚀 Passo 1: Instalar Docker Desktop

### 1.1 Baixar Docker Desktop

1. Acesse: https://www.docker.com/products/docker-desktop
2. Clique em **"Download for Windows"**
3. Aguarde o download completar (cerca de 500MB)

### 1.2 Instalar Docker Desktop

1. Execute o arquivo baixado `Docker Desktop Installer.exe`
2. Clique em **"OK"** para aceitar as configurações padrão
3. Aguarde a instalação (5-10 minutos)
4. Quando solicitar, clique em **"Fechar e reiniciar"**
5. ⚠️ **O computador vai reiniciar**

### 1.3 Configurar Docker Desktop (primeira execução)

1. Após reiniciar, o Docker Desktop abrirá automaticamente
2. Se pedir para aceitar termos de serviço, clique em **"Accept"**
3. Se pedir para fazer login, clique em **"Continue without signing in"**
4. Se mostrar um tutorial, clique em **"Skip tutorial"**
5. Aguarde até ver o ícone da baleia no canto inferior direito sem piscar

✅ **Docker instalado com sucesso!**

---

## 🚀 Passo 2: Copiar o Sistema

### 2.1 Obter os arquivos

Você receberá uma pasta chamada `sistema-certificados` (via pendrive, download, etc.)

### 2.2 Escolher localização

Coloque a pasta em um local permanente:

**Recomendado:**
```
C:\Sistemas\sistema-certificados
```

**Importante:**
- ❌ NÃO coloque na Área de Trabalho
- ❌ NÃO coloque em pasta temporária
- ❌ NÃO coloque em pendrive
- ✅ Coloque em uma pasta que NÃO será apagada

---

## 🚀 Passo 3: Configurar Endereço de Rede

### 3.1 Descobrir IP ou nome do computador

**Opção A - Descobrir IP:**

1. Pressione `Windows + R`
2. Digite `cmd` e pressione Enter
3. Digite `ipconfig` e pressione Enter
4. Procure por **"Endereço IPv4"**, será algo como: `192.168.1.100`
5. ✏️ **Anote este número**

**Opção B - Usar nome do computador:**

1. Pressione `Windows + Pause` (ou vá em Configurações → Sistema → Sobre)
2. Veja o **"Nome do dispositivo"**, será algo como: `SERVIDOR-ESCOLA`
3. ✏️ **Anote este nome**

### 3.2 Configurar IP fixo (RECOMENDADO)

Para que o endereço não mude:

1. Vá em **Configurações → Rede e Internet → Propriedades da rede**
2. Role até **Configurações de IP**
3. Clique em **"Editar"**
4. Mude de **"Automático (DHCP)"** para **"Manual"**
5. Ative **IPv4**
6. Configure:
   - **Endereço IP:** Use o IP anotado no passo anterior
   - **Máscara de sub-rede:** 255.255.255.0 (geralmente)
   - **Gateway:** Pergunte ao responsável pela rede (geralmente 192.168.1.1)
   - **DNS preferencial:** 8.8.8.8
7. Salve

---

## 🚀 Passo 4: Iniciar o Sistema

### 4.1 Primeira inicialização

1. Abra a pasta onde colocou o sistema: `C:\Sistemas\sistema-certificados`
2. Encontre o arquivo **`iniciar-sistema.bat`**
3. Clique com botão direito → **"Executar como administrador"**
4. Uma janela preta aparecerá (CMD)
5. Aguarde (2-5 minutos na primeira vez)
6. Quando aparecer a mensagem **"Sistema pronto!"**, pode fechar a janela

### 4.2 Verificar se funcionou

1. Abra o navegador (Chrome, Edge, Firefox)
2. Digite na barra de endereço: `http://localhost:3000`
3. Pressione Enter
4. ✅ **Se o sistema abrir, está funcionando!**

---

## 🚀 Passo 5: Testar de Outro Computador

### 5.1 Em outro computador da rede

1. Abra o navegador
2. Digite: `http://IP-DO-SERVIDOR:3000`
   - Exemplo: `http://192.168.1.100:3000`
   - Ou: `http://SERVIDOR-ESCOLA:3000`
3. ✅ **Se o sistema abrir, instalação completa!**

### 5.2 Se NÃO funcionar

Verifique o firewall do Windows no computador servidor:

1. Painel de Controle → Firewall do Windows
2. Clique em **"Configurações avançadas"**
3. Clique em **"Regras de Entrada"**
4. Clique em **"Nova Regra"**
5. Escolha **"Porta"** → Próximo
6. Escolha **"TCP"** e digite porta **"3000"** → Próximo
7. Escolha **"Permitir conexão"** → Próximo
8. Marque **todas** as opções → Próximo
9. Nome: `Sistema Certificados` → Concluir

Teste novamente!

---

## 🚀 Passo 6: Configurar Inicialização Automática

Para o sistema iniciar automaticamente quando o computador ligar:

### 6.1 Criar atalho de inicialização

1. Clique com botão direito em **`iniciar-sistema.bat`**
2. Escolha **"Criar atalho"**
3. Copie o atalho criado (Ctrl+C)

### 6.2 Adicionar à inicialização do Windows

1. Pressione `Windows + R`
2. Digite: `shell:startup`
3. Pressione Enter (abrirá uma pasta)
4. Cole o atalho nesta pasta (Ctrl+V)

✅ **Pronto! Agora o sistema inicia sozinho sempre que o computador ligar**

---

## 🚀 Passo 7: Criar Atalhos nos Computadores Clientes

Em cada computador que usará o sistema:

1. Abra o navegador
2. Acesse: `http://IP-DO-SERVIDOR:3000`
3. Clique nos 3 pontinhos (menu) → **"Mais ferramentas"** → **"Criar atalho"**
4. Marque **"Abrir como janela"** (opcional, fica parecido com um programa)
5. Clique em **"Criar"**

✅ **Atalho criado na área de trabalho!**

---

## 🎉 Instalação Concluída!

### ✅ Checklist final

- [ ] Docker Desktop instalado e funcionando
- [ ] Sistema copiado para local permanente
- [ ] IP fixo configurado (recomendado)
- [ ] Sistema inicia e abre em `localhost:3000`
- [ ] Sistema abre de outros computadores
- [ ] Firewall configurado (se necessário)
- [ ] Inicialização automática configurada
- [ ] Atalhos criados nos computadores clientes

---

## 📞 Próximos Passos

- Leia o **MANUAL_USUARIO.md** para aprender a usar o sistema
- Leia o **EMERGENCIA.md** para saber resolver problemas comuns
- Leia o **MANUTENCAO.md** para backup e manutenção

---

## 🆘 Problemas durante a instalação?

**Sistema não inicia:**
- Verifique se o Docker Desktop está rodando (ícone da baleia na bandeja)
- Tente reiniciar o computador

**Não abre de outros computadores:**
- Verifique se os computadores estão na mesma rede
- Verifique o firewall (Passo 5.2)
- Tente usar o IP ao invés do nome (ou vice-versa)

**Docker não instala:**
- Verifique se o Windows está atualizado
- Seu Windows precisa ser versão Pro, Enterprise ou Education (Home pode ter limitações)

---

**Data desta versão:** 2025-01-29
