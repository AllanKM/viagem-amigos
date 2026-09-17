# Búzios em Família 2026

Ferramenta web para organizar a viagem do grupo (20 a 24 pessoas) para Búzios em dezembro de 2026:
confirmação de presença, votação da casa, rateio transparente e controle de pagamentos. Feita para ser
usada pelo celular, em português.

## Como rodar

```bash
npm install
npm run preparar   # cria o banco SQLite e carrega os dados iniciais
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente <http://localhost:3000>).

O arquivo `.env` guarda três valores:

| Variável | Para que serve |
| --- | --- |
| `DATABASE_URL` | Caminho do banco SQLite (`prisma/dev.db`) |
| `ORGANIZADOR_PIN` | PIN que libera o painel do organizador (padrão: `buzios2026`) |
| `APP_SECRET` | Segredo do cookie de sessão do organizador |

Troque o PIN e o segredo antes de compartilhar o link com o grupo.

## Primeiros passos do organizador

Entre em `/organizador`, digite o PIN e faça nesta ordem:

1. **Lista de amigos** — cole todos os nomes de uma vez, um por linha, no formato
   `Nome Sobrenome | Família Allan` (o núcleo é opcional). Cada pessoa passa a aparecer na grade de fotos.
2. **Dados da viagem** — ajuste prazos, orçamento, regras de idade, percentual do sinal e a chave PIX.
3. **Casas candidatas** — confirme preço e disponibilidade nos anúncios e atualize os valores; marque como
   indisponível o que já foi alugado.
4. **Custos extras** — lance faxina, caseiro, consumo de água e luz. Viagem e transporte ficam fora do rateio.
5. **Pagamentos** — dê baixa nos sinais e saldos recebidos, por núcleo.

## Como cada pessoa usa

1. Abre o link e toca em **Confirmar presença**.
2. Clica na própria foto na grade (a borda mostra quem já respondeu).
3. Envia a própria foto pelo celular — a imagem é reduzida no aparelho antes do envio.
4. Responde: confirmado, talvez ou não vou; escolhe a data preferida; adiciona cônjuge, filhos e
   acompanhantes com idade; escreve observações (berço, mobilidade, quarto, alergias) e marca o aceite do
   sinal.
5. Vai em **Casas** e vota. Cada pessoa tem um voto por rodada e pode trocar até o fim do prazo, com
   comentário curto.

Quem clica na própria foto fica identificado no aparelho, e é isso que libera o voto e a troca de foto.

## Regras do rateio

- Cada adulto paga uma cota inteira.
- Crianças até `idadeIsenta` (padrão: 5 anos) não pagam.
- Crianças até `idadeMeia` (padrão: 12 anos) pagam metade da cota.
- Entram na conta apenas as pessoas com presença confirmada.
- O total dividido é o valor da casa com taxas mais os custos extras marcados como "incluir no rateio".
- O sinal é um percentual (padrão: 30%) do valor de cada núcleo.

A base do cálculo é a casa escolhida pelo organizador; enquanto não houver escolha, o sistema usa a casa
líder da votação.

## Casas já cadastradas

Todas foram pesquisadas para o grupo de 20 a 24 pessoas. **Só a primeira tem preço confirmado** — as
outras estão marcadas como "preço a confirmar" e precisam de checagem no anúncio para as datas em votação.

| Casa | Região | Capacidade | Situação |
| --- | --- | --- | --- |
| [Casa Búzios · 5 suítes](https://www.airbnb.com.br/rooms/913590595354183536) | Geribá / Porto da Barra | 15 | R$ 6.678 para 16–19/12; não serve sozinha para 20+ |
| [Casa da Luna](https://www.airbnb.com.br/rooms/1726018685385866160) | Geribá, pé na areia | 21 | 7 suítes, 15 camas, 9 banheiros |
| [Búzios Prime](https://www.airbnb.com.br/rooms/21024055) | Ferradura, 50 m da praia | 20 (até 30 com taxa) | 8 suítes, taxas e consumo inclusos no anúncio |
| [Mansão na Marina](https://alugoportemporada.com.br/casa-temporada/684699-mansao-na-marina-com-8-suites-e-chef-decozinha) | Região da Marina | 24 | Única que cobre as 24 pessoas com folga |
| [Mansão pé na areia](https://www.experienciaembuzios.com.br/detalhes-imovel/219-casa-temporada-ferradura-armacao-dos-buzios-rj.html) | Ferradura, pé na areia | 20 | Caseiros obrigatórios e consumo por fora |
| [Casa dos Sonhos](https://www.airbnb.com.br/rooms/2945076) | Praia do Canto | 16 (máx. 18) | Reserva caso o grupo diminua |
| [Mansão 11 suítes](https://agilizaimobiliaria.sites.robustcrm.com.br/imovel/casa_11_quartos--ferradura--armacao_dos_buzios--rj--locacao--cod-303) | Ferradura | 24 | Marcada como indisponível: diária de R$ 7.000 |

## Onde ficam os dados

- Banco: `prisma/dev.db` (SQLite). Para fazer backup, copie esse arquivo.
- Fotos: `public/uploads/`.

Nenhum dos dois vai para o Git.

## Comandos úteis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o site em modo desenvolvimento |
| `npm run build` e `npm start` | Versão de produção |
| `npm run banco:estudio` | Abre o Prisma Studio para editar o banco na mão |
| `npm run banco:migrar` | Aplica mudanças de estrutura no banco |
| `npm run banco:semear` | Recarrega os dados iniciais |

Para o grupo acessar de fora, publique em um servidor com disco persistente (o SQLite e as fotos são
arquivos em disco).
