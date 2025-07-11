const express = require('express');
const cors = require('cors');
const path = require('path');
const { downloadDataIfNeeded } = require('./services/dataDownloader');
const { loadData } = require('./services/dataLoader');
const medicamentRoutes = require('./routes/medicaments');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/medicaments', medicamentRoutes);

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Médicaments France</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .container { max-width: 900px; margin: 0 auto; }
            h1 { color: #2c5aa0; border-bottom: 3px solid #2c5aa0; padding-bottom: 10px; }
            h2 { color: #333; margin-top: 30px; }
            .endpoint { background: #f4f4f4; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .method { background: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
            .url { font-family: monospace; background: #e8e8e8; padding: 2px 6px; border-radius: 3px; }
            .param { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
            .attribution { background: #d1ecf1; border-left: 4px solid #bee5eb; padding: 15px; margin: 20px 0; }
            .example { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 10px 0; }
            pre { background: #282c34; color: #abb2bf; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .demo-section {
                margin-top: 10px;
                padding: 10px;
                background: #f8f9fa;
                border-left: 3px solid #007bff;
                border-radius: 0 5px 5px 0;
            }
            .demo-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                // margin-bottom: 10px;
                background: #e9ecef;
                padding: 8px 12px;
                border-radius: 3px;
            }
            .demo-url { 
                font-family: monospace; 
                font-size: 14px;
                flex: 1;
                margin-right: 10px;
            }
            .demo-url::before {
                content: "Exemple: ";
                font-weight: bold;
                color: #007bff;
                font-family: Arial, sans-serif;
            }
            .run-button { 
                background: #28a745; 
                color: white; 
                border: none; 
                padding: 6px 12px; 
                border-radius: 3px; 
                cursor: pointer; 
                font-size: 12px;
                font-weight: bold;
            }
            .close-button {
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border: none;
                padding: 2px 6px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                z-index: 10;
            }
            .run-button:hover { background: #218838; }
            .close-button:hover { background: rgba(0, 0, 0, 1); }
            .demo-content { 
                display: none; 
                margin-top: 10px;
            }
            .demo-result { 
                background: #282c34; 
                color: #abb2bf; 
                padding: 25px 10px 10px 10px; 
                border-radius: 3px; 
                overflow-x: auto; 
                font-family: monospace; 
                font-size: 12px;
                max-height: 300px;
                overflow-y: auto;
                white-space: pre-wrap;
                position: relative;
            }
        </style>
    </head>
    <body>
        <!-- GitHub Corner -->
        <a href="https://github.com/Gizmo091/fr.gouv.medicaments.rest" class="github-corner" aria-label="View source on GitHub">
            <svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true">
                <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
                <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
                <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
            </svg>
        </a>
        <style>
            .github-corner:hover .octo-arm { animation: octocat-wave 560ms ease-in-out }
            @keyframes octocat-wave { 0%, 100% { transform: rotate(0) } 20%, 60% { transform: rotate(-25deg) } 40%, 80% { transform: rotate(10deg) } }
            @media (max-width: 500px) { .github-corner:hover .octo-arm { animation: none } .github-corner .octo-arm { animation: octocat-wave 560ms ease-in-out } }
        </style>
        <div class="container">
            <h1>🏥 API Base de Données Publique des Médicaments</h1>
            
            <p>API REST publique pour accéder aux données officielles des médicaments en France.</p>
            
            <div class="attribution">
                <strong>Attribution:</strong> Cette API utilise la <a href="http://base-donnees-publique.medicaments.gouv.fr/" target="_blank">"base de données publique des médicaments"</a> fournie par le gouvernement français.
            </div>

            <h2>📋 Endpoints disponibles</h2>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/health</span><br>
                Status de l'API et informations de base
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/specialites</span><br>
                Liste des spécialités pharmaceutiques<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span> (recherche), 
                <span class="param">page</span> (défaut: 1), 
                <span class="param">limit</span> (défaut: 100),
                <span class="param">pretty</span> (formatage JSON)
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/specialites?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo1')">▶ Run</button>
                    </div>
                    <div id="demo1" class="demo-content">
                        <div class="demo-result" id="result1">
                            <button class="close-button" onclick="closeExample('demo1')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/specialites/:cis</span><br>
                Détail complet d'une spécialité avec toutes les données liées<br>
                <strong>Paramètres:</strong> <span class="param">pretty</span> (formatage JSON)
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/specialites/61266250?pretty=true</div>
                        <button class="run-button" onclick="runExample('demo2')">▶ Run</button>
                    </div>
                    <div id="demo2" class="demo-content">
                        <div class="demo-result" id="result2">
                            <button class="close-button" onclick="closeExample('demo2')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/presentations</span><br>
                Liste des présentations (conditionnements)<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/presentations?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo3')">▶ Run</button>
                    </div>
                    <div id="demo3" class="demo-content">
                        <div class="demo-result" id="result3">
                            <button class="close-button" onclick="closeExample('demo3')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/compositions</span><br>
                Compositions et principes actifs<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/compositions?q=paracetamol&limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo4')">▶ Run</button>
                    </div>
                    <div id="demo4" class="demo-content">
                        <div class="demo-result" id="result4">
                            <button class="close-button" onclick="closeExample('demo4')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/avis-smr</span><br>
                Avis SMR de la HAS<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/avis-smr?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo5')">▶ Run</button>
                    </div>
                    <div id="demo5" class="demo-content">
                        <div class="demo-result" id="result5">
                            <button class="close-button" onclick="closeExample('demo5')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/avis-asmr</span><br>
                Avis ASMR de la HAS<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/avis-asmr?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo6')">▶ Run</button>
                    </div>
                    <div id="demo6" class="demo-content">
                        <div class="demo-result" id="result6">
                            <button class="close-button" onclick="closeExample('demo6')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/groupes-generiques</span><br>
                Groupes génériques<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/groupes-generiques?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo7')">▶ Run</button>
                    </div>
                    <div id="demo7" class="demo-content">
                        <div class="demo-result" id="result7">
                            <button class="close-button" onclick="closeExample('demo7')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/conditions</span><br>
                Conditions de prescription et délivrance<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/conditions?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo8')">▶ Run</button>
                    </div>
                    <div id="demo8" class="demo-content">
                        <div class="demo-result" id="result8">
                            <button class="close-button" onclick="closeExample('demo8')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/disponibilite</span><br>
                Disponibilité et ruptures d'approvisionnement<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/disponibilite?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo9')">▶ Run</button>
                    </div>
                    <div id="demo9" class="demo-content">
                        <div class="demo-result" id="result9">
                            <button class="close-button" onclick="closeExample('demo9')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/interet-therapeutique-majeur</span><br>
                Médicaments d'intérêt thérapeutique majeur (MITM)<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span>, <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/interet-therapeutique-majeur?limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo10')">▶ Run</button>
                    </div>
                    <div id="demo10" class="demo-content">
                        <div class="demo-result" id="result10">
                            <button class="close-button" onclick="closeExample('demo10')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/medicaments/search</span><br>
                Recherche globale dans toutes les données<br>
                <strong>Paramètres:</strong> 
                <span class="param">q</span> (requis), <span class="param">page</span>, <span class="param">limit</span>, <span class="param">pretty</span>
                <div class="demo-section">
                    <div class="demo-header">
                        <div class="demo-url">GET /api/medicaments/search?q=doliprane&limit=2&pretty=true</div>
                        <button class="run-button" onclick="runExample('demo11')">▶ Run</button>
                    </div>
                    <div id="demo11" class="demo-content">
                        <div class="demo-result" id="result11">
                            <button class="close-button" onclick="closeExample('demo11')">×</button>
                            Cliquez sur "Run" pour voir le résultat
                        </div>
                    </div>
                </div>
            </div>

            <h2>🔍 Recherche avec wildcards</h2>
            <p>Vous pouvez utiliser des wildcards dans vos recherches :</p>
            <ul>
                <li><strong>*</strong> - remplace plusieurs caractères</li>
                <li><strong>?</strong> - remplace un seul caractère</li>
            </ul>

            <h2>✨ Formatage JSON</h2>
            <p>Ajoutez le paramètre <span class="param">pretty=true</span> ou <span class="param">pretty=1</span> pour obtenir un JSON formaté et indenté, idéal pour la lecture humaine.</p>

            <h2>📝 Exemples d'utilisation</h2>

            <div class="example">
                <strong>Rechercher tous les médicaments contenant "doliprane" :</strong><br>
                <span class="url">GET /api/medicaments/specialites?q=doliprane*</span>
            </div>

            <div class="example">
                <strong>Rechercher des comprimés :</strong><br>
                <span class="url">GET /api/medicaments/presentations?q=*comprimé*</span>
            </div>

            <div class="example">
                <strong>Rechercher du paracétamol :</strong><br>
                <span class="url">GET /api/medicaments/compositions?q=paracetamol</span>
            </div>

            <div class="example">
                <strong>Voir les ruptures de stock :</strong><br>
                <span class="url">GET /api/medicaments/disponibilite?q=rupture</span>
            </div>

            <div class="example">
                <strong>Recherche globale :</strong><br>
                <span class="url">GET /api/medicaments/search?q=aspirine</span>
            </div>

            <div class="example">
                <strong>Avec formatage JSON :</strong><br>
                <span class="url">GET /api/medicaments/specialites?q=doliprane&pretty=true</span>
            </div>

            <h2>📄 Format de réponse</h2>
            <p>Toutes les réponses sont au format JSON avec pagination et métadonnées :</p>
            <pre>{
  "data": [...],
  "pagination": {
    "total": 1234,
    "page": 1,
    "limit": 100,
    "pages": 13
  },
  "metadata": {
    "last_updated": "2024-07-07T10:30:00.000Z",
    "source": "base de données publique des médicaments - gouv.fr"
  }
}</pre>

            <h2>ℹ️ Informations techniques</h2>
            <ul>
                <li><strong>Format :</strong> JSON</li>
                <li><strong>Authentification :</strong> Aucune</li>
                <li><strong>CORS :</strong> Activé</li>
                <li><strong>Mise à jour :</strong> Automatique toutes les 24h</li>
                <li><strong>Limite par page :</strong> 1000 maximum</li>
            </ul>

            <h2>🔗 Liens utiles</h2>
            <ul>
                <li><a href="/api/health">Status de l'API</a></li>
                <li><a href="/api/medicaments/specialites?limit=5">Exemple: 5 spécialités</a></li>
                <li><a href="/api/medicaments/specialites?limit=3&pretty=true">Exemple: 3 spécialités (formaté)</a></li>
                <li><a href="/api/medicaments/disponibilite?limit=5">Exemple: Disponibilité</a></li>
                <li><a href="/api/medicaments/avis-smr?limit=3">Exemple: Avis SMR</a></li>
                <li><a href="/api/medicaments/search?q=doliprane">Exemple: Recherche Doliprane</a></li>
                <li><a href="http://base-donnees-publique.medicaments.gouv.fr/" target="_blank">Source officielle des données</a></li>
            </ul>
        </div>
        
        <script>
            const demoUrls = {
                'demo1': '/api/medicaments/specialites?limit=2&pretty=true',
                'demo2': '/api/medicaments/specialites/61266250?pretty=true',
                'demo3': '/api/medicaments/presentations?limit=2&pretty=true',
                'demo4': '/api/medicaments/compositions?q=paracetamol&limit=2&pretty=true',
                'demo5': '/api/medicaments/avis-smr?limit=2&pretty=true',
                'demo6': '/api/medicaments/avis-asmr?limit=2&pretty=true',
                'demo7': '/api/medicaments/groupes-generiques?limit=2&pretty=true',
                'demo8': '/api/medicaments/conditions?limit=2&pretty=true',
                'demo9': '/api/medicaments/disponibilite?limit=2&pretty=true',
                'demo10': '/api/medicaments/interet-therapeutique-majeur?limit=2&pretty=true',
                'demo11': '/api/medicaments/search?q=doliprane&limit=2&pretty=true'
            };

            function runExample(demoId) {
                const demoContent = document.getElementById(demoId);
                const resultDiv = document.getElementById('result' + demoId.replace('demo', ''));
                
                // Afficher le contenu s'il est caché
                if (demoContent.style.display === 'none' || demoContent.style.display === '') {
                    demoContent.style.display = 'block';
                }
                
                // Charger l'exemple
                loadExample(demoId, resultDiv);
            }

            function closeExample(demoId) {
                const demoContent = document.getElementById(demoId);
                demoContent.style.display = 'none';
            }

            async function loadExample(demoId, resultDiv) {
                try {
                    // Conserver le bouton de fermeture
                    const closeButton = resultDiv.querySelector('.close-button');
                    
                    // Remplacer seulement le texte, pas le bouton
                    const textNodes = Array.from(resultDiv.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                    textNodes.forEach(node => node.textContent = 'Chargement...');
                    
                    const response = await fetch(demoUrls[demoId]);
                    
                    if (!response.ok) {
                        throw new Error(\`HTTP \${response.status}\`);
                    }
                    
                    // Récupérer le JSON et le formater proprement
                    const jsonData = await response.json();
                    
                    // Supprimer tous les noeuds sauf le bouton
                    Array.from(resultDiv.childNodes).forEach(node => {
                        if (node !== closeButton) {
                            resultDiv.removeChild(node);
                        }
                    });
                    
                    // Ajouter le JSON comme noeud texte
                    const jsonText = document.createTextNode(JSON.stringify(jsonData, null, 2));
                    resultDiv.appendChild(jsonText);
                } catch (error) {
                    // Garder le bouton et remplacer le reste
                    const closeButton = resultDiv.querySelector('.close-button');
                    Array.from(resultDiv.childNodes).forEach(node => {
                        if (node !== closeButton) {
                            resultDiv.removeChild(node);
                        }
                    });
                    const errorText = document.createTextNode(\`Erreur: \${error.message}\`);
                    resultDiv.appendChild(errorText);
                }
            }
        </script>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  const { getMetadata } = require('./services/dataLoader');
  const metadata = getMetadata();
  const { pretty } = req.query;
  
  const responseData = { 
    status: 'ok', 
    message: 'API des médicaments française',
    attribution: 'base de données publique des médicaments - gouv.fr',
    metadata: {
      last_updated: metadata.last_updated,
      source: metadata.source
    }
  };

  if (pretty === 'true' || pretty === '1') {
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(responseData, null, 2));
  } else {
    res.json(responseData);
  }
});

async function startServer() {
  try {
    console.log('Vérification et téléchargement des données...');
    await downloadDataIfNeeded();
    
    console.log('Chargement des données en mémoire...');
    await loadData();
    
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Erreur au démarrage:', error);
    process.exit(1);
  }
}

startServer();