# Ski Rekenmeester 🎿

Een leuke webapp om 7-jarige kinderen te helpen met het automatiseren van rekenen in een ski-thema.

## Kenmerken

- **Ski-thema**: De skiër wordt beter naarmate het kind beter rekent.
- **Progressieve moeilijkheidsgraad**: Sommen worden geleidelijk moeilijker.
- **Beloningssysteem**: Muntjes verdienen bij snelle en correcte antwoorden.
- **Volledig responsief**: Werkt perfect op Android tablets en telefoons.
- **Gepersonaliseerd voor Bram**: Met foto's, familieleden en persoonlijke aanmoedigingen.

## Personalisatie

De app is speciaal gemaakt voor Bram (7 jaar) en bevat:

- **Persoonlijke foto's**: Foto's van Bram verschijnen als beloning bij mijlpalen.
- **Familie-aanmoedigingen**: Familieleden (ouders, broertje, opa's en oma's) geven complimenten.
- **Persoonlijke vragen**: Vragen met verwijzingen naar Bram's leven (school, woonplaats, familie).
- **Dynamische moeilijkheidsgraad**: Past zich aan aan Bram's niveau.

## Gebruik

1. Open de webapp op je Android-apparaat
2. Klik op "Start het Avontuur" om te beginnen
3. Beantwoord de rekenopdrachten door op het juiste antwoord te klikken
4. Verzamel muntjes en verbeter je skivaardigheden!

## Niveaus

1. **Beginnershelling**: Eenvoudige optellingen (getallen 1-10)
2. **Blauwe piste**: Optellen en aftrekken (getallen 1-20)
3. **Rode piste**: Optellen en aftrekken (getallen 1-50)
4. **Zwarte piste**: Optellen, aftrekken en vermenigvuldigen (getallen 1-100)
5. **Off-piste**: Optellen, aftrekken, vermenigvuldigen en delen (getallen 10-100)

## Persoonlijke foto's toevoegen

Om de app te personaliseren met foto's van Bram:

1. Plaats de foto's in de map `public/images/personal/`
2. Zorg ervoor dat er een bestand is met de naam `bram_foto.jpg`
3. Herstart de app om de wijzigingen te zien

## Technische informatie

De webapp is gemaakt met:
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion (voor animaties)

## Lokaal ontwikkelen

```bash
# Installeer afhankelijkheden
npm install

# Start een lokale ontwikkelserver
npm run dev

# Bouw de app voor productie
npm run build
```

## Deployment naar Vercel

Deze app is geoptimaliseerd voor deployment naar Vercel:

1. Push de code naar een GitHub repository
2. Verbind de repository met je Vercel account
3. Volg de Vercel deployment stappen

Of gebruik de Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Licentie

MIT 