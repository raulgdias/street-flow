import Link from "next/link";
import {
  ArrowUpRight,
  BatteryCharging,
  Gauge,
  MoveRight,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const heroImage =
  "https://images.unsplash.com/photo-1614213812711-26ae849ce5da?auto=format&fit=crop&w=1800&q=90";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="container-shell py-5 md:py-8">
          <div className="relative min-h-[680px] overflow-hidden rounded-[2rem] bg-forest-950 text-white md:min-h-[720px] md:rounded-[2.75rem]">
            <div
              className="absolute inset-0 bg-cover bg-[center_35%] opacity-55"
              style={{ backgroundImage: `url(${heroImage})` }}
              role="img"
              aria-label="Pessoa explorando a cidade sobre rodas"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,39,30,.96)_0%,rgba(16,39,30,.75)_42%,rgba(16,39,30,.12)_78%)]" />
            <div className="absolute -right-20 -top-24 size-80 rounded-full border-[54px] border-lime-300/80" />
            <div className="relative z-10 flex min-h-[680px] max-w-3xl flex-col justify-end p-7 md:min-h-[720px] md:justify-center md:p-16 lg:p-20">
              <div className="mb-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur md:mb-8">
                <Sparkles size={15} className="text-lime-300" />
                Mobilidade que cabe na sua rotina
              </div>
              <p className="eyebrow text-lime-300">Vá além do caminho óbvio</p>
              <h1 className="font-display mt-5 max-w-3xl text-[clamp(3.6rem,8vw,7.8rem)] font-bold leading-[0.84] tracking-[-0.085em]">
                A cidade.
                <br />
                Seu ritmo.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/72 md:text-lg">
                Patins elétricos potentes, compactos e prontos para transformar
                deslocamentos comuns em trajetos memoráveis.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="button-lime">
                  Explorar modelos <MoveRight size={18} />
                </Link>
                <a
                  href="#tecnologia"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Conheça a tecnologia
                </a>
              </div>
            </div>
            <div className="absolute bottom-8 right-8 hidden rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-lg lg:block">
              <p className="eyebrow text-white/55">Pronto para a rua</p>
              <p className="mt-2 font-display text-2xl font-bold">
                Leve. Ligue. Flua.
              </p>
            </div>
          </div>
        </section>

        <section className="container-shell py-16 md:py-24" id="tecnologia">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="eyebrow text-coral-500">
                Tecnologia sem complicação
              </p>
              <h2 className="font-display mt-4 text-4xl font-bold leading-[0.96] tracking-[-0.065em] md:text-6xl">
                Mais cidade.
                <br />
                Menos espera.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-forest-950/65">
              Controle intuitivo, resposta progressiva e energia para o trajeto
              inteiro. Tudo foi pensado para desaparecer da sua atenção e deixar
              só a sensação de movimento.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Gauge,
                value: "25 km/h",
                label: "Velocidade máxima",
                text: "Três modos de condução para evoluir com confiança.",
              },
              {
                icon: BatteryCharging,
                value: "16 km",
                label: "Autonomia urbana",
                text: "Carga suficiente para o corre do dia e a volta para casa.",
              },
              {
                icon: Zap,
                value: "80 min",
                label: "Carga rápida",
                text: "De 20% a 80% enquanto você pausa para um café.",
              },
            ].map(({ icon: Icon, value, label, text }, index) => (
              <article
                key={label}
                className={`rounded-[1.75rem] p-7 ${index === 1 ? "bg-lime-300" : "bg-white"}`}
              >
                <Icon size={28} strokeWidth={1.8} />
                <p className="font-display mt-12 text-4xl font-bold tracking-[-0.06em]">
                  {value}
                </p>
                <p className="mt-1 text-sm font-bold">{label}</p>
                <p className="mt-5 text-sm leading-6 text-forest-950/60">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="bg-forest-950 py-20 text-white md:py-28"
          id="seguranca"
        >
          <div className="container-shell grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="relative overflow-hidden rounded-[2rem] bg-coral-500 p-8 md:p-12">
              <div className="absolute -right-16 -top-16 size-56 rounded-full border-[38px] border-forest-950/20" />
              <ShieldCheck size={50} strokeWidth={1.5} />
              <p className="font-display mt-28 max-w-md text-4xl font-bold leading-[0.98] tracking-[-0.06em] md:text-5xl">
                Confiança em cada curva.
              </p>
            </div>
            <div className="lg:pl-10">
              <p className="eyebrow text-lime-300">Segurança ativa</p>
              <h2 className="font-display mt-5 text-4xl font-bold leading-tight tracking-[-0.055em] md:text-5xl">
                Controle é liberdade.
              </h2>
              <div className="mt-8 grid gap-6">
                {[
                  [
                    "Frenagem regenerativa",
                    "Reduza com suavidade e recupere energia em movimento.",
                  ],
                  [
                    "Resposta progressiva",
                    "Aceleração previsível, sem sustos, em qualquer modo.",
                  ],
                  [
                    "Estrutura reforçada",
                    "Materiais escolhidos para absorver o uso real da cidade.",
                  ],
                ].map(([title, text], index) => (
                  <div
                    key={title}
                    className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-white/12 pb-6"
                  >
                    <span className="font-display text-sm font-bold text-lime-300">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container-shell py-20 md:py-28">
          <Link
            href="/shop"
            className="group grid overflow-hidden rounded-[2rem] bg-lime-300 p-8 transition-transform hover:-translate-y-1 md:grid-cols-[1fr_auto] md:items-end md:p-14"
          >
            <div>
              <p className="eyebrow">Sua próxima rota começa aqui</p>
              <h2 className="font-display mt-5 max-w-3xl text-4xl font-bold leading-[0.95] tracking-[-0.07em] md:text-6xl">
                Escolha seu flow.
              </h2>
            </div>
            <span className="mt-10 grid size-16 place-items-center rounded-full bg-forest-950 text-white transition-transform group-hover:rotate-45 md:mt-0 md:size-20">
              <ArrowUpRight size={30} />
            </span>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
