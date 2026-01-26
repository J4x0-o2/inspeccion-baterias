#!/bin/bash
# Script de validación de cambios

echo "✅ VALIDACIÓN DE ESTRUCTURA"
echo ""

echo "1️⃣ Archivos admin eliminados:"
if [ ! -f "admin.html" ] && [ ! -f "js/admin.js" ]; then
    echo "   ✅ No existen archivos admin"
else
    echo "   ❌ Aún hay archivos admin"
fi

echo ""
echo "2️⃣ HTML sin referencias hardcodeadas:"
if grep -q "option value=\"244105506R\"" index.html; then
    echo "   ❌ Aún hay referencias en HTML"
else
    echo "   ✅ Referencias removidas del HTML"
fi

echo ""
echo "3️⃣ Archivos de sincronización de referencias:"
if [ -f "js/referencias-sync.js" ] && [ -f "js/sync-referencias.js" ]; then
    echo "   ✅ Archivos de sincronización presentes"
else
    echo "   ❌ Faltan archivos de sincronización"
fi

echo ""
echo "4️⃣ Orden de scripts en index.html:"
echo "   Orden esperado:"
echo "   1. config.js"
echo "   2. database.js"
echo "   3. api.js"
echo "   4. referencias-sync.js ← DEBE SER ANTES DE app.js"
echo "   5. sync.js"
echo "   6. sync-referencias.js"
echo "   7. app.js"

echo ""
echo "5️⃣ Netlify Functions configuradas:"
ls -1 netlify/functions/ | grep -E "referencias|send-to-sheets"

echo ""
echo "✅ VALIDACIÓN COMPLETADA"
echo ""
echo "PRÓXIMOS PASOS:"
echo "1. Configura Google Sheets (consulta GOOGLE_SHEETS_SETUP.md)"
echo "2. Despliega Google Apps Script"
echo "3. Agrega GOOGLE_SHEET_URL a variables de entorno en Netlify"
echo "4. Redeploy"
