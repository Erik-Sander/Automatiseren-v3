#!/bin/bash

echo "🎿 Ski Rekenmeester - Installatie script 🎿"
echo "==========================================="
echo ""

# Controleer of npm is geïnstalleerd
if ! command -v npm &> /dev/null; then
  echo "❌ npm is niet geïnstalleerd. Installeer Node.js en npm eerst."
  exit 1
fi

echo "📦 Installeren van afhankelijkheden..."
npm install

if [ $? -eq 0 ]; then
  echo "✅ Installatie succesvol!"
  echo ""
  
  # Controleer of de persoonlijke foto's map bestaat
  if [ ! -d "public/images/personal" ]; then
    echo "📁 Aanmaken van map voor persoonlijke foto's..."
    mkdir -p public/images/personal
  fi
  
  # Controleer of er al een foto is
  if [ ! -f "public/images/personal/bram_foto.jpg" ]; then
    echo "🖼️ Let op: Plaats een foto van Bram in de map 'public/images/personal/' met de naam 'bram_foto.jpg'"
  else
    echo "🖼️ Persoonlijke foto gevonden!"
  fi
  
  echo ""
  echo "🚀 Start de ontwikkelserver met:"
  echo "npm run dev"
  echo ""
  echo "🔨 Build voor productie met:"
  echo "npm run build"
  echo ""
  echo "🌐 Deploy naar Vercel met:"
  echo "npx vercel"
  echo ""
  echo "Bedankt voor het gebruiken van Ski Rekenmeester! ❄️"
  echo "Deze app is speciaal gemaakt voor Bram! 🧒"
else
  echo "❌ Er ging iets mis bij het installeren van de afhankelijkheden."
  echo "Controleer de foutmeldingen hierboven voor meer informatie."
  exit 1
fi 