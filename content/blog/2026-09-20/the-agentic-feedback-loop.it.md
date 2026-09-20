+++
author = "Nicola Gallo"

title = "Il feedback loop agentico: dall'intelligenza adattiva all'esecuzione governata"

date = "2026-09-20T09:00:00+00:00"

description = "Gli AI Agent cambiano il software quando smettono di limitarsi a produrre risposte e iniziano a perseguire outcome in un mondo che cambia. Questo articolo esplora il feedback loop agentico, spiega perché il controllo deterministico rimane fondamentale, perché l'esecuzione diventa un oggetto architetturale di prima classe e come security, evidenza, osservabilità del rischio residuo e governance possano creare valore economico attorno ai sistemi autonomi."

tags = ["ai agents", "agentic ai", "feedback loops", "systems thinking", "outcome-oriented programming", "execution", "security", "governance", "risk", "insurance", "runtime", "ai architecture"]

+++

<figure class="post-banner">
  <img src="/images/2026-09-20/the-agentic-feedback-loop.png"
       alt="Il feedback loop agentico: dall'intelligenza adattiva all'esecuzione governata."
       loading="lazy">
</figure>

Immaginiamo una serra commerciale che contiene una coltura del valore di 500.000 EUR.

La temperatura è una delle variabili che determinano se quella coltura sopravvivrà.

Se rimane troppo bassa troppo a lungo, la crescita può subire danni.

Se diventa troppo alta, la coltura stessa può essere a rischio.

La serra dispone quindi di capacità deterministiche come:

```text
read_internal_temperature()

read_external_weather()

adjust_heating()

control_ventilation()
```

L'outcome desiderato è semplice da esprimere:

```text
OUTCOME

Mantenere le condizioni della serra
all'interno dell'intervallo operativo sicuro.
```

Per semplicità, supponiamo che l'intervallo di temperatura desiderato sia:

```text
20°C - 22°C
```

Ma la serra non è soltanto un sistema fisico.

È anche un asset economico.

E quell'asset può essere assicurato.

---

## Partiamo dal rischio economico

Immaginiamo, come esempio architetturale, che la serra sia coperta da una polizza assicurativa parametrica.

Una polizza parametrica può definire in anticipo una condizione misurabile.

Per esempio:

```text
ASSET ASSICURATO
    |
    v
Coltura in serra commerciale
Valore: 500.000 EUR


CONDIZIONE PARAMETRICA
    |
    v
Temperatura interna > 30°C
per più di 20 minuti consecutivi


ORACOLO AFFIDABILE
    |
    +---- sensori della serra
    |
    +---- dati ambientali
    |
    +---- timestamp affidabili
    |
    v
La condizione assicurata si è verificata?


INDENNIZZO
    |
    v
Importo o formula predeterminati,
secondo i termini della polizza
```

I valori sono puramente illustrativi.

Ciò che conta è la distinzione architetturale.

La polizza definisce **quale evento fisico è rilevante**.

L'oracolo fornisce evidenza affidabile sul fatto che quell'evento si sia verificato.

Ma l'oracolo racconta soltanto una parte della storia.

Può dirci:

```text
La serra ha superato i 30°C
per venti minuti.
```

Non ci dice necessariamente:

```text
Che cosa sapeva il sistema operativo?

Quando ha rilevato il problema?

Quale decisione è stata presa?

Quali safeguard erano attivi?

È stata necessaria un'escalation?

Quale azione è stata effettivamente eseguita?
```

Queste sono domande sull'**esecuzione**.

---

## Evidenza dell'oracolo ed evidenza di esecuzione

Si tratta di due tipi differenti di evidenza.

```text
+--------------------------+       +---------------------------+
| EVIDENZA DELL'ORACOLO    |       | EVIDENZA DI ESECUZIONE    |
+--------------------------+       +---------------------------+
|                          |       |                           |
| Che cosa è accaduto?     |       | Come è stato gestito?     |
|                          |       |                           |
| temperatura              |       | osservazione              |
| meteo                    |       | decisione                 |
| durata                   |       | azione proposta           |
| timestamp                |       | safeguard                 |
| trigger assicurativo     |       | escalation                |
|                          |       | effetto accettato         |
|                          |       | risultato osservato       |
+--------------------------+       +---------------------------+
             |                                   |
             +----------------+------------------+
                              |
                              v
                    VISIONE PIÙ COMPLETA
                         DEL RISCHIO
```

L'evidenza dell'oracolo descrive il mondo.

L'evidenza di esecuzione descrive come il sistema ha operato all'interno di quel mondo.

Questa distinzione è importante anche dal punto di vista assicurativo.

L'oracolo può stabilire se il parametro previsto dal contratto si è effettivamente verificato.

L'evidenza di esecuzione risponde invece a domande diverse:

```text
La condizione anomala è stata rilevata?

I safeguard sono rimasti attivi?

Il sistema ha tentato di mitigare il problema?

Ha seguito il percorso di governance previsto?

È stata eseguita un'escalation?

Quali azioni hanno realmente
raggiunto il sistema?
```

L'evidenza di esecuzione non sostituisce il trigger contrattuale.

Il suo valore è diverso.

Permette di mostrare **come il rischio assicurato è stato effettivamente gestito** prima, durante e dopo l'evento.

Per comprendere perché questo sia importante per gli AI Agent, dobbiamo però partire dal feedback loop.

---

## Prima dell'AI: il closed loop

Non abbiamo bisogno di un AI Agent per controllare la temperatura.

Un termostato convenzionale implementa già un sistema closed-loop.

Supponiamo che il sensore rilevi:

```text
18°C
```

mentre l'intervallo desiderato è:

```text
20°C - 22°C
```

Un controller deterministico può applicare:

```text
if temperature < 20°C:
    increase heating
```

Poi osserva nuovamente.

```text
18°C
  |
  v
aumenta il riscaldamento
  |
  v
19°C
  |
  v
aumenta il riscaldamento
  |
  v
21°C
```

La struttura di base è:

```text
OSSERVA
   |
   v
CONFRONTA <--------- STATO DESIDERATO
   |
   v
DECIDI
   |
   v
AGISCI
   |
   v
MONDO
   |
   +----------> OSSERVA
```

Il controller non presume che un'azione abbia prodotto il risultato atteso.

Osserva nuovamente il mondo.

Confronta lo stato reale con quello desiderato.

Poi corregge.

Questo è feedback.

---

## Un closed loop non è automaticamente agentico

Un controller può essere estremamente sofisticato senza essere un AI Agent.

Può utilizzare:

```text
sensori di temperatura

temperatura esterna

modelli termici

previsioni meteorologiche

ottimizzazione

coefficienti adattivi
```

Un **Model Predictive Controller** può prevedere il comportamento futuro, ottimizzare una traiettoria su un determinato orizzonte temporale, eseguirne una parte, osservare il risultato e ricalcolare.

È già estremamente potente.

Quando il problema è ben modellato, lo stato è strutturato e le possibili azioni sono note, un controller deterministico può essere esattamente ciò che vogliamo.

Può essere meno costoso.

Più prevedibile.

Più stabile.

E più semplice da verificare.

Quindi il valore di un LLM **non** consiste semplicemente nel fatto che:

> "Può leggere le previsioni meteorologiche e scegliere una percentuale di riscaldamento migliore."

Un buon controller deterministico sa già farlo.

Il problema realmente agentico inizia quando il modello, il contesto o lo spazio delle possibili strategie non sono più completamente predefiniti.

---

## Dove l'Agent inizia ad aggiungere valore

Supponiamo che il controller della serra preveda:

```text
atteso:
20,5°C

osservato:
18,6°C
```

Qualcosa non torna.

Un controller deterministico può compensare.

Ma un Agent può indagare una domanda più ampia:

> **Perché il sistema si sta comportando diversamente rispetto al modello previsto?**

Può analizzare fonti eterogenee:

```text
sensori di temperatura

previsioni meteorologiche

stato della ventilazione

storico della manutenzione

allarmi delle apparecchiature

vincoli energetici

istruzioni agronomiche

note degli operatori
```

Potrebbe scoprire:

```text
Unità di riscaldamento:
    funzionante

Temperatura esterna:
    più bassa del previsto

Ventilazione:
    la bocchetta 3 sembra
    parzialmente aperta

Registro di manutenzione:
    ispezione dell'attuatore scaduta
```

A questo punto la decisione non consiste più semplicemente nel:

```text
aumentare il riscaldamento
di un altro 10%
```

L'Agent può ragionare tra classi di azioni differenti:

```text
aumentare il riscaldamento

ridurre la ventilazione

ispezionare l'attuatore

richiedere manutenzione

avvisare l'agronomo

modificare la strategia ambientale
```

Questo è un problema diverso.

```text
MODELLO NOTO
+
STATO NOTO
+
SPAZIO DELLE AZIONI NOTO
        |
        v
CONTROLLO DETERMINISTICO
```

rispetto a:

```text
MODELLO INCOMPLETO
+
CONTESTO ETEROGENEO
+
SPAZIO DELLE STRATEGIE APERTO
        |
        v
REASONING AGENTICO
```

È qui che l'intelligenza adattiva diventa interessante.

---

## Il feedback loop agentico

L'outcome desiderato rimane stabile.

Il percorso per raggiungerlo non deve necessariamente esserlo.

```text
                   OUTCOME DESIDERATO
                          |
                          v
                     +---------+
                     | CONFRONTA|
                     +----+----+
                          ^
                          |
                       OSSERVA
                          |
                          v
                        RAGIONA
                          |
                          v
                  PIANIFICA / DECIDI
                          |
                          v
                         AGISCI
                          |
                          v
                        MONDO
                          |
                          +---------> OSSERVA
```

Ogni fase ha un ruolo differente.

```text
OSSERVA

Che cosa sta accadendo?


VALUTA / CONFRONTA

Dove si trova lo stato corrente
rispetto all'outcome desiderato?


RAGIONA

Perché esiste uno scostamento?

Che cosa è cambiato?

Quali alternative esistono?


PIANIFICA / DECIDI

Che cosa dovrebbe accadere ora?


AGISCI

Proponi un effetto sul mondo.
```

Il punto importante è che **il replanning non è un secondo loop**.

Quando arriva nuova evidenza, l'Agent entra nuovamente nello stesso loop.

```text
OSSERVA
   |
   v
VALUTA
   |
   v
RAGIONA
   |
   v
DECIDI
   |
   v
AGISCI
   |
   v
MONDO
   |
   +----------> OSSERVA
```

Un'osservazione diversa può produrre una strategia diversa.

Questo è adattamento.

---

## Il piano non è più il programma

Il software tradizionale spesso presume che gran parte del percorso futuro sia definito prima che inizi l'esecuzione.

```text
Passo 1
   |
   v
Passo 2
   |
   v
Passo 3
   |
   v
Passo 4
```

L'esecuzione agentica può essere diversa.

```text
Mondo W0
   |
   v
Decisione A1
   |
   v
Mondo W1
   |
   v
Decisione A2
   |
   v
Mondo W2
   |
   v
Decisione A3
```

Ogni nuovo stato può contenere informazioni che non esistevano quando l'esecuzione è iniziata.

L'Agent può scoprire un attuatore guasto.

Una nuova previsione.

Un allarme di manutenzione.

Sensori in conflitto.

Una nuova istruzione da parte di un operatore.

L'outcome rimane relativamente stabile.

Il percorso evolve.

> **L'Agent non si limita a eseguire un piano. Costruisce continuamente la parte successiva dell'esecuzione a partire dal feedback.**

---

## In realtà esistono tre loop

Un sistema agentico fisico non dovrebbe avere un unico gigantesco AI loop che controlla tutto.

È più utile considerarlo come un insieme di loop che operano su scale temporali differenti.

### 1. Il fast deterministic control loop

```text
SENSORE
  |
  v
CONTROLLER DETERMINISTICO
  |
  v
ATTUATORE
  |
  v
MONDO
  |
  +----------> SENSORE
```

Questo loop può essere eseguito ogni secondo o ogni millisecondo.

Può gestire:

```text
setpoint

rate limit

interlock fisici

hard safety envelope

arresto di emergenza
```

Questo loop continua a funzionare anche quando l'AI Agent è in sleep.

---

### 2. L'agentic adaptation loop

```text
OSSERVA
   |
   v
VALUTA
   |
   v
RAGIONA
   |
   v
CAMBIA STRATEGIA
   |
   v
WAIT
```

Questo loop opera a un livello semantico superiore.

Può essere eseguito ogni pochi minuti, ogni ora oppure soltanto quando cambia qualcosa di significativo.

L'Agent può decidere di:

```text
cambiare strategia

richiedere manutenzione

ispezionare un altro sistema

modificare parametri target

interpellare un altro Agent

avvisare un essere umano
```

L'Agent non deve controllare il processo fisico ogni millisecondo.

Adatta la strategia mentre i sistemi deterministici sottostanti continuano a funzionare.

---

### 3. Il governance loop

```text
EVIDENZA DI ESECUZIONE
        |
        v
    STATO DI RISCHIO
        |
        v
      GOVERNANCE
        |
   +----+----+
   |         |
continua   escalation
vincola    nega
```

Questo loop può attivarsi quando:

```text
il rischio aumenta

l'authority è insufficiente

manca evidenza

ci si avvicina ai limiti di sicurezza

è richiesta accountability umana
```

I tre loop hanno responsabilità differenti.

```text
FAST

controllo fisico
millisecondi / secondi


ADAPTIVE

reasoning dell'Agent
minuti / ore / eventi


GOVERNANCE

rischio / authority / accountability
eccezioni / decisioni
```

---

## WAIT non significa che il sistema si fermi

Supponiamo che la serra sia stabile a:

```text
21°C
```

L'Agent può entrare nello stato:

```text
WAIT
```

Questo significa:

```text
interrompere il reasoning AI

non consumare inference

persistere ciò che è necessario

attendere un trigger significativo
```

**Non** significa che la serra smetta di essere controllata.

```text
AI AGENT
   |
   | WAIT
   v
 SLEEP


CONTROLLO DETERMINISTICO
   |
   | continua a funzionare
   v
LA SERRA RIMANE CONTROLLATA
```

L'Agent può dormire.

Il sistema di controllo no.

---

## Che cosa risveglia l'Agent?

L'Agent non dovrebbe risvegliarsi ogni volta che un sensore cambia di 0,1°C.

Significherebbe semplicemente ricreare un busy loop usando inference costosa.

Le condizioni di wake-up dovrebbero essere generate da meccanismi deterministici.

Per esempio:

```text
la temperatura esce dalla banda consentita

la previsione cambia in modo significativo

il disaccordo tra sensori supera una soglia

compare un allarme dell'apparecchiatura

cambia lo stato di manutenzione

scade un timer

arriva un evento esterno
```

Queste regole possono risiedere in:

```text
controller industriali

application monitoring

rules engine

Agent framework

event processor specifici del dominio
```

Non appartengono al generic execution proxy.

Per esempio, un'applicazione per la serra può emettere:

```text
temperature.out_of_band
```

AEF non deve sapere perché quella temperatura sia considerata fuori intervallo.

Deve soltanto trasportare l'evento verso l'esecuzione corretta.

Il dominio possiede il significato.

L'execution layer trasporta l'occurrence.

---

## Il loop logico non è un processo permanente

Un Agent può operare in questo modo:

```text
08:00

Occurrence 1

osserva
ragiona
propone

WAIT
```

Poi:

```text
09:15

temperature.out_of_band

Occurrence 2

osserva
ragiona
propone

WAIT
```

E ancora:

```text
13:40

allarme di manutenzione

Occurrence 3

osserva
ragiona
propone
```

Quindi:

```text
feedback loop logico

!=

un processo AI
permanentemente in esecuzione
```

Il loop può estendersi attraverso:

```text
processi

servizi

messaggi

macchine

esseri umani

minuti

ore

giorni
```

È qui che l'esecuzione stessa diventa importante.

---

## L'esecuzione diventa un oggetto di prima classe

Se un Agent agisce ora, va in sleep, si risveglia a causa di un evento, chiama un altro servizio, attende un essere umano e continua il giorno successivo, che cosa collega tutti questi momenti?

Non necessariamente un singolo processo.

Non un thread.

Non una singola conversazione con un LLM.

L'oggetto che li collega è l'**esecuzione**.

```text
Outcome desiderato
      |
      v
Occurrence 1
      |
      v
Il mondo cambia
      |
      v
Occurrence 2
      |
      v
Servizio esterno
      |
      v
Occurrence 3
      |
      v
Decisione umana
      |
      v
Occurrence 4
```

Quando l'esecuzione attraversa sistemi e tempo, diventa utile un'infrastruttura generica per gestire:

```text
execution identity

occurrence identity

correlation

routing

persistence

retry

timeout

delivery

checkpointing

security context

evidence
```

Sono responsabilità dell'esecuzione.

Non richiedono di comprendere l'agronomia di una serra.

---

## Entra in scena Permguard Agentic Execution Fabric (AEF)

Questo è il ruolo di **Permguard Agentic Execution Fabric (AEF)**.

AEF è un execution layer generico attorno agli AI Agent.

Può funzionare con Agent framework differenti, aziende differenti e settori completamente differenti.

Per questo motivo esiste un principio fondamentale:

> **AEF non deve contenere application logic o business logic.**

L'Agent possiede il significato.

I sistemi di dominio possiedono le regole di dominio.

I controller industriali possiedono il controllo fisico.

I sistemi di risk e governance possiedono le decisioni specifiche del dominio.

AEF possiede l'esecuzione attorno a questi componenti.

```text
+----------------------------+
|       AI AGENT / APP       |
+----------------------------+
| outcome                    |
| significato di dominio     |
| diagnosi                   |
| reasoning                  |
| strategia                  |
| decisioni di business      |
+-------------+--------------+
              |
              v
+----------------------------+
|          AEF EDGE          |
+----------------------------+
| generic execution proxy    |
| trusted execution state    |
| security boundary          |
| authority virtualization   |
| continuity                 |
| correlation                |
| routing / transport        |
| persistence                |
| execution evidence         |
| audit / observability      |
+-------------+--------------+
              |
              v
+----------------------------+
|      SISTEMI ESTERNI       |
+----------------------------+
| controller                 |
| API                        |
| tool                       |
| message system             |
| altri Agent                |
| servizi di governance      |
| sistemi fisici             |
+----------------------------+
```

AEF non contiene logica come:

```text
if temperature > 22°C:
    reduce heating
```

Non decide che:

```text
23°C sono pericolosi

la coltura ha bisogno di più umidità

la previsione richiede raffreddamento

va richiesta manutenzione
```

Quella conoscenza rimane fuori da AEF.

---

## L'Edge è un proxy, non un business brain

Un buon mental model è:

```text
AI AGENT
    |
    | proposta / evento / chiamata
    v
+------------------------+
|       AEF EDGE         |
+------------------------+
| execution proxy        |
| security boundary      |
| authority continuity   |
| correlation            |
| transport              |
| persistence            |
| evidence               |
| observability          |
+-----------+------------+
            |
            v
        MONDO ESTERNO
```

L'Edge contiene le meccaniche di execution e security.

Non contiene business reasoning.

> **AEF trasporta l'esecuzione. L'Agent costruisce il significato.**

---

## La stabilità rimane sotto l'Agent

Gli LLM hanno:

```text
latenza variabile

output non deterministici

percorsi di reasoning variabili
```

Un sistema fisico non dovrebbe dipendere direttamente da ogni output dell'Agent.

Immaginiamo:

```text
forecast cambiato

Agent:
aumenta il target


forecast cambiato di nuovo

Agent:
riduci il target


forecast cambiato ancora

Agent:
aumenta il target
```

Un adaptive loop lento può destabilizzare un fast physical loop se l'architettura non ne vincola l'interazione.

La soluzione non è inserire logica della serra dentro AEF.

La soluzione è preservare la gerarchia.

```text
              AI AGENT
                 |
          proposta strategica
                 |
                 v
              AEF EDGE
                 |
          execution crossing
                 |
                 v
       CONTROLLER DETERMINISTICO
                 |
          stabilità / safety
                 |
                 v
               MONDO
```

Il controller deterministico può gestire:

```text
rate limit

setpoint smoothing

limiti fisici

protezione degli attuatori

arresto di emergenza
```

Sono proprietà del sistema di controllo.

Non business logic di AEF.

---

## Reasoning non significa authority

Quando un Agent può produrre effetti reali, diventa importante un'ulteriore distinzione.

L'Agent può ragionare:

```text
Dovrei richiedere manutenzione.
```

oppure:

```text
Dovrei modificare la strategia ambientale.
```

Ma:

> **Reasoning is not authority.**

Il fatto che un Agent concluda che un'azione sia utile non significa che debba possedere la backend credential che rende possibile quell'azione.

I sistemi tradizionali spesso espongono authority tramite credentials come:

```text
OAuth access token

API key

service-account credential
```

Per un AI Agent, questa è l'astrazione sbagliata.

L'Agent dovrebbe ragionare su:

> **Che cosa può proporre questa esecuzione?**

non su:

> Quale backend credential riutilizzabile possiedo?

---

## Virtualized Credentials

Nel modello Permguard, l'AI Agent riceve **virtualized credentials** che rappresentano l'authority visibile alla sua esecuzione corrente.

Il formato esatto non è rilevante in questa sede.

In futuro potranno essere rappresentate attraverso meccanismi implementativi differenti.

Ciò che conta è il contratto architetturale, non l'encoding.

```text
TRUSTED EXECUTION STATE
        |
        | projection
        v
VIRTUALIZED CREDENTIALS
        |
        v
     AI AGENT
```

Le virtualized credentials possono esporre soltanto ciò che serve all'Agent per ragionare:

```text
execution identity

permission disponibili

constraint visibili

authority reference rilevanti
```

**Non sono backend credentials.**

Non sono OAuth access token.

Non sono API key.

Non sono lo stato PIC autorevole.

E presentarle direttamente a un backend estraneo non dovrebbe conferire alcuna authority.

Il loro scopo è permettere all'Agent di comprendere che cosa l'esecuzione corrente può proporre.

> **L'Agent ragiona sulle virtualized credentials. Il trusted execution boundary possiede l'authority continuity.**

Questo distingue il modello anche dalla semplice secret isolation.

La proprietà importante non è soltanto che l'Agent non veda un secret.

L'authority esposta all'Agent è associata a una **specifica esecuzione**, non semplicemente all'identità dell'Agent.

---

## L'Agent propone. Il boundary fa avanzare l'authority.

Supponiamo che l'esecuzione corrente permetta all'Agent di proporre:

```text
environment.control

maintenance.request
```

L'Agent può concludere che sia necessaria manutenzione.

Invia una proposta ad AEF.

```text
AI AGENT
    |
    | proposta
    | virtualized credentials
    v
AEF EDGE
    |
    | risolve il trusted execution state
    | verifica la current authority
    | valida la continuation
    | crea la successiva occurrence accettata
    v
NEXT EXECUTION STATE
```

L'Agent non certifica la propria continuation.

Non crea la relazione causale che rende valido lo stato successivo.

Propone.

Il trusted boundary verifica e fa avanzare l'esecuzione.

Al di sotto di questa astrazione, **PIC — Provenance Identity Continuity — mantiene l'authority legata all'esecuzione causale nel tempo**.

I dettagli del protocollo PIC e della relativa proof machinery sono un argomento separato.

---

## Anche una nuova authority è una proposta

Talvolta l'esecuzione corrente non possiede authority sufficiente per la strategia che l'Agent vuole perseguire.

Per esempio:

```text
DISPONIBILE:

environment.control
maintenance.request


NECESSARIO:

ventilation.override
```

L'Agent può richiedere nuova authority.

```text
AI AGENT
    |
    | richiesta di authority aggiuntiva
    v
AEF / TRUSTED BOUNDARY
    |
    | decisione di authority / governance
    v
NEW EXECUTION ORIGIN
    |
    | nuove virtualized credentials
    v
AI AGENT
```

L'Agent chiede.

Non concede authority a se stesso.

Una trusted authority source deve ammettere la nuova origin.

I sistemi esistenti di identity e authorization possono continuare a essere sorgenti dell'authority iniziale.

Nell'architettura Permguard più ampia, **PIC-X** rappresenta la direzione di integrazione per tradurre authority esistente in un initial PIC execution context.

Quel meccanismo di origination è distinto dalla normale execution continuation.

---

## La composition segue la stessa regola

L'Agent può anche determinare che siano necessari insieme due authority context indipendenti.

Per esempio:

```text
AUTHORITY A:
environment.control

AUTHORITY B:
maintenance.override
```

L'Agent può ragionare:

```text
Ho bisogno di entrambi i context
per completare questa strategia.
```

Può proporre una composition.

```text
VIRTUALIZED A -------\
                      \
                       >--- AI AGENT
                      /        |
VIRTUALIZED B -------/         |
                               |
                        PROPOSE COMPOSE
                               |
                               v
                           AEF / GATE
                               |
                      verifica i parent context
                      applica la composition policy
                      ammette / restringe / nega
                               |
                               v
                       NEW EXECUTION CONTEXT
```

L'Agent non unisce l'authority autonomamente.

Possedere o vedere due authority context non implica il diritto di combinarli.

> **L'Agent può proporre la composition. Il trusted boundary esegue la composition.**

Anche in questo caso AEF non deve sapere perché la strategia della serra richieda quelle permission.

Questo rimane application reasoning.

---

## AEF collega l'agentic loop al mondo

L'architettura diventa ora semplice.

```text
                         OUTCOME DESIDERATO
                               |
                               v
                    +----------------------+
                    |       AI AGENT       |
                    +----------------------+
                    | osserva              |
                    | valuta               |
                    | ragiona              |
                    | pianifica / decide   |
                    |                      |
                    | virtualized          |
                    | credentials          |
                    +----------+-----------+
                               |
                            PROPOSTA
                               |
                               v
                    +----------------------+
                    |       AEF EDGE       |
                    +----------------------+
                    | trusted execution    |
                    | security boundary    |
                    | authority continuity |
                    | correlation          |
                    | transport            |
                    | persistence          |
                    | evidence             |
                    | observability        |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | SISTEMI ESTERNI      |
                    +----------------------+
                    | controller           |
                    | API                  |
                    | tool                 |
                    | essere umano         |
                    | altro Agent          |
                    | macchina             |
                    +----------+-----------+
                               |
                          IL MONDO CAMBIA
                               |
                               v
                           FATTI / EVENTI
                               |
                               v
                              AEF
                               |
                               v
                           AI AGENT
                               |
                               v
                            OSSERVA
```

L'Agent chiude l'**adaptive loop**.

Il controller deterministico chiude il **fast physical loop**.

La governance chiude il **risk and accountability loop**.

AEF trasporta l'esecuzione distribuita tra questi sistemi.

---

## L'esecuzione produce evidenza

Quando l'esecuzione diventa esplicita, può produrre evidenza strutturata.

Per esempio:

```text
12:00

OSSERVAZIONE
perdita termica inattesa

AGENT
indaga le possibili cause

PROPOSTA
ispezionare l'attuatore
della ventilazione

AUTHORITY
proposta consentita
dall'esecuzione corrente

AEF
continuation accettata

SISTEMA DI MANUTENZIONE
ispezione accettata

RISULTATO
rilevato guasto all'attuatore
```

Più tardi:

```text
13:20

AGENT
propone un intervento più forte

CURRENT AUTHORITY
insufficiente

GOVERNANCE
necessaria authority aggiuntiva

AEF
esecuzione sospesa

TRUSTED DECISION
nuova authority accettata

AEF
esecuzione ripresa

RISULTATO
controller esterno aggiornato
```

AEF non deve comprendere perché l'azione di manutenzione sia importante.

Può comunque conservare:

```text
quale execution

quale occurrence

quale authority state

quale proposta

quale trusted decision

quale sistema esterno

quale risultato

quale timestamp
```

Questa è execution observability.

---

## Dall'observability alla governance

L'observability tradizionale ci fornisce:

```text
log

metriche

trace
```

L'esecuzione agentica introduce nuove domande:

```text
Perché questo Agent è stato attivato?

Quale evento ha causato questa occurrence?

Quale authority era visibile?

Quale azione è stata proposta?

La continuation è stata accettata?

Era necessaria authority aggiuntiva?

L'esecuzione è stata sospesa?

Quale decisione di governance
ha permesso di continuare?

Che cosa è successo dopo?
```

Queste domande riguardano il ciclo di vita dell'esecuzione autonoma stessa.

Questo crea un percorso da:

```text
observability
```

a:

```text
governability
```

perché l'evidenza può influenzare ciò che accadrà successivamente.

```text
ESECUZIONE
    |
    v
EVIDENZA
    |
    v
RISK / GOVERNANCE SYSTEM
    |
    +------ continua
    |
    +------ vincola
    |
    +------ richiede authority
    |
    +------ richiede approvazione umana
    |
    +------ nega
    |
    v
TRUSTED DECISION
    |
    v
AEF
    |
    v
ESECUZIONE SUCCESSIVA
```

AEF non calcola il business risk.

Espone execution evidence e fornisce il boundary attraverso cui le trusted decision diventano operative.

---

## Il rischio residuo diventa più osservabile

Nessuna architettura elimina l'incertezza.

Una previsione può essere sbagliata.

Un sensore può derivare.

Un attuatore può guastarsi.

L'Agent può interpretare male la situazione.

Un essere umano può prendere una decisione errata.

La domanda utile quindi non è:

```text
Il rischio può diventare zero?
```

Non può.

La domanda più utile è:

> **Il rischio residuo può diventare osservabile e governabile mentre l'esecuzione è ancora in corso?**

Questo crea una separazione utile.

```text
SECURITY

Vincola l'esecuzione.


RISK

Valuta ciò che può ancora
andare storto.


GOVERNANCE

Decide se quel rischio
sia accettabile.


ACCOUNTABILITY

Determina chi può assumersi
la responsabilità di quella decisione.
```

---

## Torniamo all'assicurazione

Torniamo ora alla serra.

Due serre fisicamente identiche possono esporre informazioni molto diverse sul rischio operativo.

La prima può fornire:

```text
storico delle temperature

registri di manutenzione

log delle apparecchiature
```

La seconda può fornire:

```text
trusted oracle evidence

execution history

storico delle attivazioni dell'Agent

authority history

proposte esterne

governance escalation

effetti accettati

outcome osservati
```

Il rischio fisico continua a esistere.

Ma l'**asimmetria informativa** tra operatore e assicuratore può essere inferiore.

L'assicuratore può comprendere non soltanto:

```text
Che cosa è accaduto?
```

ma anche:

```text
Come veniva gestito l'asset?

Sono state rilevate condizioni anomale?

Quali safeguard sono rimasti attivi?

L'autonomous authority era sufficiente?

È stato tentato un intervento di mitigazione?

È stata necessaria un'escalation?

Quali azioni hanno realmente
raggiunto il sistema?
```

Questo può avere valore economico.

La distinzione è utile:

```text
ORACOLO

L'evento assicurato
si è verificato?


EVIDENZA DI ESECUZIONE

Come si è comportato
il sistema autonomo assicurato
prima, durante e dopo l'evento?
```

Un trigger parametrico può determinare se l'evento previsto dal contratto si sia verificato.

L'evidenza di esecuzione può invece fornire un quadro molto più ricco di come il rischio assicurato sia stato gestito.

---

## Evidenza di diligenza

L'evidenza di esecuzione non dimostra automaticamente la due diligence sul piano legale.

E non dimostra automaticamente l'assenza di una condotta intenzionale.

Non produce nemmeno automaticamente un premio assicurativo più basso.

Queste conclusioni dipendono da fattori come:

```text
struttura della polizza

modello di underwriting

giurisdizione

interpretazione giuridica

risk appetite

metodologia dell'assicuratore

qualità dell'evidenza
```

Ma l'evidenza di esecuzione può rendere la diligenza operativa molto più osservabile e valutabile.

Questo può essere importante anche quando il meccanismo di indennizzo è parametrico.

Il trigger può stabilire che l'evento assicurato si sia verificato, mentre l'evidenza di esecuzione può mostrare se:

```text
i safeguard sono rimasti attivi

le condizioni anomale sono state rilevate

è stata tentata una mitigazione

i limiti di authority sono stati rispettati

è stata eseguita un'escalation

è stato richiesto un intervento umano

i controlli sono stati preservati o bypassati
```

Da sola non dimostra la diligenza sul piano legale e non stabilisce l'intenzionalità di una condotta.

Ma fornisce all'assicuratore molte più informazioni con cui valutare il comportamento del sistema.

Concettualmente:

```text
OPERAZIONE MENO OSSERVABILE

rischio fisico
+
informazioni limitate
su come viene gestito

        |
        v

maggiore incertezza
```

rispetto a:

```text
OPERAZIONE PIÙ OSSERVABILE

rischio fisico
+
execution evidence
+
authority history
+
controlli
+
governance history

        |
        v

informazioni migliori
su come viene gestito il rischio
```

Se un assicuratore riconoscesse queste informazioni, potrebbero potenzialmente influenzare:

```text
premio

franchigia

limiti di copertura

condizioni di copertura

requisiti di risk engineering
```

L'affermazione non è:

> Una AI migliore significa un'assicurazione meno costosa.

È:

> **Una migliore evidenza di esecuzione può ridurre l'incertezza sul modo in cui viene gestito il rischio autonomo.**

E una minore incertezza può avere valore economico.

---

## Evidenza dell'oracolo ed evidenza di esecuzione rimangono differenti

Un indennizzo parametrico può continuare a dipendere semplicemente da:

```text
temperatura > 30°C
per più di 20 minuti
```

verificato dall'oracolo previsto dal contratto e nel rispetto dei termini della polizza.

L'evidenza di esecuzione non dovrebbe modificare implicitamente quella condizione, a meno che il contratto non la renda esplicitamente parte del trigger.

Il suo ruolo è differente.

```text
EVIDENZA DELL'ORACOLO

L'evento fisico assicurato
si è verificato?


EVIDENZA DI ESECUZIONE

Come si è comportato
il sistema autonomo
durante la gestione dell'asset?
```

Insieme forniscono una visione più completa.

La prima stabilisce che cosa è accaduto nell'ambiente assicurato.

La seconda rende visibile come il sistema autonomo ha reagito.

---

## Il salto generazionale

La prima ondata di Generative AI ha cambiato il modo in cui il software viene prodotto.

```text
REQUISITO
    |
    v
SVILUPPATORE + AI
    |
    v
CODICE
    |
    v
APPLICAZIONE
```

Gli Agent introducono un cambiamento più profondo.

L'intelligenza comincia a partecipare all'esecuzione stessa.

```text
INTENT
   |
   v
OUTCOME DESIDERATO
   |
   v
AI REASONING
   |
   v
ESECUZIONE DINAMICA
   |
   v
MONDO
   |
   v
FEEDBACK
   |
   +--------> AI REASONING
```

Il percorso futuro non deve più essere completamente definito prima dell'inizio dell'esecuzione.

Una parte può essere costruita mentre la realtà cambia.

È un cambiamento molto più profondo di:

> L'AI scrive software più velocemente.

È più vicino a:

> **L'intelligenza adatta continuamente l'esecuzione attorno a un outcome mentre il mondo cambia continuamente sotto di essa.**

---

## Il software deterministico non scompare

Questo non significa sostituire software affidabile con LLM.

Al contrario.

```text
LLM / AGENT

usali quando servono
interpretazione e open-ended reasoning


SOFTWARE DETERMINISTICO

usalo quando il comportamento
è già noto


CONTROL SYSTEM

usali quando contano timing,
stabilità e safety


AEF

usalo per trasportare
l'esecuzione distribuita degli Agent
attraverso i boundary
senza assorbire business logic
```

Se un MPC può controllare la serra, usa un MPC.

Se una regola deterministica può valutare una soglia, usa una regola deterministica.

Se serve un Agent per interpretare una situazione ambigua e scegliere tra strategie eterogenee, usa l'Agent.

E se l'Agent ha bisogno di authority:

> **Forniscigli virtualized credentials che descrivano ciò che l'esecuzione corrente può proporre, non le backend credentials riutilizzabili e il trusted continuity state che rendono possibile l'effetto.**

---

## Il nuovo valore dell'esecuzione

Storicamente, l'applicazione era spesso l'oggetto importante.

L'esecuzione era semplicemente l'applicazione in funzione.

I sistemi agentici cambiano questa prospettiva.

L'esecuzione stessa comincia a portare:

```text
outcome

stato

tempo

causalità

authority

decisioni

effetti esterni

evidenza

rischio

governance history
```

E poiché AEF rimane generico, lo stesso execution substrate può supportare:

```text
Agent differenti

framework differenti

aziende differenti

settori differenti

business logic differente
```

Il fabric non deve comprendere il business.

Deve rendere l'esecuzione esplicita, sicura, osservabile e governabile.

---

## Il mental model finale

L'architettura può essere ridotta a poche responsabilità ben separate.

```text
+---------------------------------------------------+
|                    AI AGENT                       |
+---------------------------------------------------+
|                                                   |
| comprende il significato di dominio               |
| valuta l'outcome                                  |
| formula diagnosi                                  |
| ragiona                                           |
| sceglie la strategia                              |
| ragiona sulle virtualized credentials             |
| propone azioni                                    |
|                                                   |
| NO BACKEND CREDENTIALS                            |
| NO TRUSTED CONTINUITY STATE                       |
| NO PIC TRANSITION LOGIC                           |
|                                                   |
+-------------------------+-------------------------+
                          |
                       PROPOSTA
                          |
                          v
+---------------------------------------------------+
|                     AEF                           |
+---------------------------------------------------+
|                                                   |
| generic execution proxy                           |
| trusted execution state                           |
| authority continuity                              |
| next occurrence                                   |
| origination coordination                          |
| composition gate                                  |
| correlation                                       |
| persistence                                       |
| transport                                         |
| evidence                                          |
| observability                                     |
|                                                   |
| NO APPLICATION / BUSINESS LOGIC                   |
|                                                   |
+-------------------------+-------------------------+
                          |
                          v
+---------------------------------------------------+
|          DOMAIN / GOVERNANCE SYSTEMS              |
+---------------------------------------------------+
|                                                   |
| controllo fisico                                  |
| business API                                      |
| regole di dominio                                 |
| safety controller                                 |
| risk engine                                       |
| decisioni di governance                           |
| credential infrastructure                         |
|                                                   |
+-------------------------+-------------------------+
                          |
                          v
+---------------------------------------------------+
|                     MONDO                         |
+---------------------------------------------------+
|                                                   |
| macchine                                          |
| sensori                                           |
| esseri umani                                      |
| sistemi software                                  |
| altri Agent                                       |
|                                                   |
+---------------------------------------------------+
```

L'interazione con l'authority è altrettanto semplice:

```text
TRUSTED EXECUTION AUTHORITY
        |
        | PROJECTION
        v
VIRTUALIZED CREDENTIALS
        |
        v
     AI AGENT
        |
        | PROPOSTA
        v
     AEF EDGE
        |
        +-- continuation
        |
        +-- richiesta nuova authority
        |
        +-- richiesta di composition
```

E l'invariante è:

> **L'Agent ragiona. L'Agent propone. Il trusted execution boundary fa avanzare l'authority.**

---

## La vera transizione agentica

Il futuro degli AI Agent non sarà determinato soltanto da quanto diventeranno intelligenti i modelli.

Le domande più difficili iniziano dopo il reasoning.

Un Agent può andare in sleep e risvegliarsi soltanto quando accade qualcosa di significativo?

I sistemi deterministici possono mantenere stabile il mondo mentre dorme?

L'Agent può diagnosticare situazioni che non erano state completamente modellate in anticipo?

Può ragionare sull'authority senza possedere OAuth token, API key o backend credentials?

Può richiedere nuova authority senza poterla concedere a se stesso?

Authority context indipendenti possono essere composti senza permettere all'Agent di eseguire autonomamente quella composition?

L'esecuzione può attraversare servizi, Agent, esseri umani e tempo senza diventare opaca?

La runtime evidence può rendere visibile il rischio residuo?

La governance può intervenire mentre l'esecuzione è ancora in corso?

Quell'evidenza può mostrare non soltanto che si è verificato un evento avverso, ma anche in che modo il sistema autonomo ha cercato di rilevarlo, contenerlo e mitigarne gli effetti?

Quell'evidenza può ridurre l'incertezza per istituzioni come gli assicuratori?

Questa è la transizione più profonda.

Non:

> **L'AI genera output migliori.**

E nemmeno:

> **L'AI scrive software più velocemente.**

Ma:

> **L'intelligenza persegue outcome attraverso adaptive reasoning, mentre un execution fabric generico collega quel reasoning a un mondo che non può essere conosciuto in anticipo.**

L'Agent possiede il significato.

L'Agent ragiona sulle virtualized credentials.

Le real backend credentials rimangono fuori dall'Agent runtime.

PIC mantiene l'authority legata all'esecuzione causale.

I sistemi deterministici possiedono il controllo fisico stabile.

I sistemi esterni possiedono le decisioni di risk e governance specifiche del dominio.

**AEF possiede l'esecuzione tra questi componenti.**

E quando l'esecuzione diventa esplicita, sicura, osservabile e governabile, smette di essere semplice infrastruttura.

Diventa il punto in cui intelligence, authority, security, risk, accountability e valore economico finalmente si incontrano.
