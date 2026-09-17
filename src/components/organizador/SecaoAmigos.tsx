import {
  adicionarAmigos,
  alternarOrganizador,
  excluirAmigo,
  reabrirResposta,
} from "@/actions/organizador";
import { Avatar } from "@/components/Avatar";
import { BotaoAcao } from "@/components/BotaoAcao";
import { FormAcao } from "@/components/FormAcao";
import { SeloStatus } from "@/components/SeloStatus";
import { dataCurta, whatsappLink } from "@/lib/formato";

type AmigoLista = {
  id: string;
  nome: string;
  sobrenome: string;
  fotoUrl: string | null;
  whatsapp: string;
  status: string;
  adulto: boolean;
  idade: number | null;
  naLista: boolean;
  organizador: boolean;
  observacoes: string;
  respondidoEm: Date | null;
  nucleo: { nome: string } | null;
  preferenciaData: { rotulo: string } | null;
  responsavel: { id: string; nome: string } | null;
};

export function SecaoAmigos({ amigos }: { amigos: AmigoLista[] }) {
  const lista = amigos.filter((amigo) => amigo.naLista);
  const acompanhantes = amigos.filter((amigo) => !amigo.naLista);

  return (
    <section className="cartao">
      <h2 className="font-display text-xl">Lista de amigos</h2>
      <p className="mt-1 text-sm text-oceano-800/75">
        Quem está nesta lista aparece na grade de fotos e pode confirmar presença clicando no próprio
        rosto. Cada pessoa envia a própria foto pelo celular.
      </p>

      <details className="mt-3 rounded-2xl bg-areia-100/70 p-3" open={lista.length <= 1}>
        <summary className="cursor-pointer font-medium text-oceano-900">
          + Adicionar pessoas em lote
        </summary>
        <FormAcao acao={adicionarAmigos} textoBotao="Adicionar à lista" className="mt-3">
          <div>
            <label className="rotulo" htmlFor="lista">
              Uma pessoa por linha
            </label>
            <textarea
              id="lista"
              name="lista"
              rows={8}
              placeholder={"Allan Souza | Família Allan\nCarla Souza | Família Allan\nPedro Lima | Família Lima"}
              className="campo font-mono text-sm"
            />
            <p className="mt-1 text-xs text-oceano-800/60">
              O núcleo depois do traço vertical é opcional: cada pessoa também pode ajustar isso na própria
              confirmação.
            </p>
          </div>
        </FormAcao>
      </details>

      <ul className="mt-4 divide-y divide-areia-200 overflow-hidden rounded-2xl border border-areia-200">
        {lista.map((amigo) => (
          <li key={amigo.id} className="bg-white/70 p-3">
            <div className="flex items-start gap-3">
              <Avatar nome={amigo.nome} sobrenome={amigo.sobrenome} fotoUrl={amigo.fotoUrl} tamanho="p" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium text-oceano-900">
                  {amigo.nome} {amigo.sobrenome}
                  {amigo.organizador && <span className="selo bg-mar-100 text-mar-700">organizador</span>}
                </p>
                <p className="text-xs text-oceano-800/65">
                  {amigo.nucleo?.nome ?? "sem núcleo"}
                  {amigo.whatsapp && ` · ${amigo.whatsapp}`}
                  {amigo.respondidoEm && ` · respondeu em ${dataCurta(amigo.respondidoEm)}`}
                  {amigo.preferenciaData && ` · prefere ${amigo.preferenciaData.rotulo}`}
                </p>
                {amigo.observacoes && (
                  <p className="mt-1 rounded-xl bg-areia-100 px-3 py-2 text-xs text-oceano-800/85">
                    {amigo.observacoes}
                  </p>
                )}
              </div>
              <SeloStatus status={amigo.status} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 pl-13 text-xs">
              {whatsappLink(amigo.whatsapp) && (
                <a
                  href={whatsappLink(amigo.whatsapp)!}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-folha-600 underline decoration-dotted"
                >
                  chamar no WhatsApp
                </a>
              )}
              <form action={alternarOrganizador}>
                <input type="hidden" name="id" value={amigo.id} />
                <BotaoAcao className="font-medium text-oceano-800/70 underline decoration-dotted">
                  {amigo.organizador ? "remover marca de organizador" : "marcar como organizador"}
                </BotaoAcao>
              </form>
              {amigo.status !== "PENDENTE" && (
                <form action={reabrirResposta}>
                  <input type="hidden" name="id" value={amigo.id} />
                  <BotaoAcao
                    className="font-medium text-oceano-800/70 underline decoration-dotted"
                    confirmar={`Apagar a resposta de ${amigo.nome} e os acompanhantes cadastrados por ele?`}
                  >
                    reabrir resposta
                  </BotaoAcao>
                </form>
              )}
              <form action={excluirAmigo}>
                <input type="hidden" name="id" value={amigo.id} />
                <BotaoAcao
                  className="font-medium text-coral-600 underline decoration-dotted"
                  confirmar={`Remover ${amigo.nome} da lista?`}
                >
                  remover
                </BotaoAcao>
              </form>
            </div>
          </li>
        ))}
      </ul>

      {acompanhantes.length > 0 && (
        <div className="mt-4">
          <h3 className="font-display text-lg">Acompanhantes cadastrados pelos responsáveis</h3>
          <ul className="mt-2 divide-y divide-areia-200 overflow-hidden rounded-2xl border border-areia-200">
            {acompanhantes.map((pessoa) => (
              <li key={pessoa.id} className="flex items-center gap-3 bg-white/70 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-oceano-900">{pessoa.nome}</p>
                  <p className="text-xs text-oceano-800/65">
                    {pessoa.adulto ? "Adulto" : `Criança${pessoa.idade !== null ? ` · ${pessoa.idade} anos` : ""}`}
                    {pessoa.nucleo && ` · ${pessoa.nucleo.nome}`}
                    {pessoa.responsavel && ` · por ${pessoa.responsavel.nome}`}
                  </p>
                </div>
                <SeloStatus status={pessoa.status} />
                <form action={excluirAmigo}>
                  <input type="hidden" name="id" value={pessoa.id} />
                  <BotaoAcao
                    className="text-xs font-medium text-coral-600 underline decoration-dotted"
                    confirmar={`Remover ${pessoa.nome}?`}
                  >
                    remover
                  </BotaoAcao>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
