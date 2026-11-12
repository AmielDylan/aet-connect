"use client";

// Proposition C · « Le tri » : comme la page des demandes d'accès, la liste à gauche et le membre choisi en
// détail à droite ; on gère sur place. Sur mobile, le membre s'ouvre dans la liste, sous son nom.
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Drapeau } from "@/components/landing/drapeau";
import { Portrait } from "@/components/espace/portrait";
import {
  ChoixAmbassadeurMembre,
  ChoixRole,
  EnteteMaquette,
  MOI_ID,
  Outils,
  Statut,
  Supprimer,
  depuis,
  invitations,
  nom,
  useMembres,
  type Etat,
  type Membre,
} from "../commun";

/** entete=false : dans la liste dépliée (mobile), le nom et le portrait sont déjà au-dessus */
function Detail({
  m,
  e,
  onSupprime,
  entete = true,
}: {
  m: Membre;
  e: Etat;
  onSupprime: () => void;
  entete?: boolean;
}) {
  const moi = m.id === MOI_ID;
  return (
    <div className="grid gap-6">
      {entete && (
        <div className="flex items-center gap-4">
          <Portrait
            prenom={m.first_name}
            nom={m.last_name}
            className="size-16 shrink-0 rounded-2xl rounded-tr-[28px] bg-vert text-lg text-creme"
          />
          <div className="min-w-0">
            <h2 className="font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">
              {nom(m)}{" "}
              {moi && (
                <span className="font-texte text-base font-normal text-olive">
                  · vous
                </span>
              )}
            </h2>
            <p className="flex items-center gap-2 text-base text-encre">
              {m.ecole} <Drapeau pays={m.pays} className="h-3.5 w-auto" /> ·
              promo {m.entry_year}
            </p>
          </div>
        </div>
      )}
      <dl className="grid gap-x-6 text-base sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-y-2 [&>dt:first-child]:mt-0 [&>dt]:mt-3 [&>dt]:text-sm sm:[&>dt]:mt-0 sm:[&>dt]:text-base">
        <dt className="text-olive">Email</dt>
        <dd className="break-all">{m.email}</dd>
        {m.current_city && (
          <>
            <dt className="text-olive">Vit à</dt>
            <dd>{m.current_city}</dd>
          </>
        )}
        <dt className="text-olive">Arrivée</dt>
        <dd>{depuis(m.created_at)}</dd>
        <dt className="text-olive">Invitations</dt>
        <dd>{invitations(m)}</dd>
      </dl>
      <ChoixRole m={m} e={e} moi={moi} />
      <ChoixAmbassadeurMembre m={m} e={e} />
      <div className="flex flex-wrap items-center gap-x-6">
        <a
          href="#"
          className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre"
        >
          Voir son profil
        </a>
      </div>
      <Supprimer m={m} e={e} moi={moi} onFait={onSupprime} />
    </div>
  );
}

/** Grand écran : un membre est toujours choisi (affiché à droite). Mobile : chaque membre se déplie sur place. */
const grandEcran = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 1024px)").matches;

export default function PropositionC() {
  const e = useMembres();
  const [choisi, setChoisi] = useState<string | null>(null);
  // À droite, sur grand écran : le membre choisi, ou à défaut le premier de la liste
  const actif = e.visibles.find((m) => m.id === choisi) ?? e.visibles[0];
  const n = e.compte("tous");

  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">
          Les membres
        </h1>
        <p className="mt-3 text-lg text-olive">
          {e.ecole
            ? `${n} ${n > 1 ? "membres" : "membre"} de ${e.ecole}`
            : `${e.membres.length} membres dans le réseau`}
          {e.recherche.trim() && ` pour « ${e.recherche.trim()} »`}.
        </p>

        <div className="mt-8">
          <Outils e={e} />
        </div>

        {e.visibles.length === 0 ? (
          <p className="mt-6 rounded-3xl bg-white p-8 text-center text-base text-olive">
            Aucun membre ne correspond.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <ul className="grid grid-cols-[minmax(0,1fr)] content-start gap-2">
              {e.visibles.map((m) => {
                const deplie = m.id === choisi; // mobile
                const choisiIci = m.id === actif?.id; // grand écran
                return (
                  <li
                    key={m.id}
                    className={`rounded-2xl transition-colors ${
                      deplie
                        ? "max-lg:bg-white max-lg:ring-2 max-lg:ring-vert"
                        : "max-lg:bg-white/60"
                    } ${choisiIci ? "lg:bg-white lg:ring-2 lg:ring-vert" : "lg:bg-white/60 lg:hover:bg-white"}`}
                  >
                    <button
                      type="button"
                      aria-expanded={deplie}
                      onClick={() =>
                        setChoisi(grandEcran() ? m.id : deplie ? null : m.id)
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <Portrait
                        prenom={m.first_name}
                        nom={m.last_name}
                        className="size-10 shrink-0 rounded-full bg-vert text-sm text-creme"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-vert">
                          {nom(m)}
                        </span>
                        <span className="block truncate text-sm text-olive">
                          {m.ecole} · {m.entry_year}
                          {(m.role !== "alumni" || m.is_ambassador) && " · "}
                          <Statut m={m} />
                        </span>
                      </span>
                      <ChevronDown
                        className={`size-5 shrink-0 text-vert transition-transform duration-200 lg:hidden ${deplie ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                    {deplie && (
                      <div className="px-4 pb-5 pt-2 lg:hidden">
                        <Detail
                          m={m}
                          e={e}
                          onSupprime={() => setChoisi(null)}
                          entete={false}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
              <li className="pt-2 text-center text-sm text-olive">
                50 membres par page · « Voir plus de membres »
              </li>
            </ul>
            <section
              aria-label="Le membre choisi"
              className="hidden self-start rounded-3xl bg-white p-8 lg:sticky lg:top-6 lg:block"
            >
              {actif && (
                <Detail
                  key={actif.id}
                  m={actif}
                  e={e}
                  onSupprime={() => setChoisi(null)}
                />
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
