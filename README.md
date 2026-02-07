# sdcc-pricerunner-ml-frontend
Frontend for PriceRunner ML Pipeline

Questa applicazione è una Single Page Application (SPA) moderna sviluppata in React e Vite, progettata per interagire con l'architettura serverless AWS Lambda. La dashboard offre un'interfaccia intuitiva per gestire l'intero ciclo di vita del Machine Learning:

Training Interattivo: Tramite la Training Card, gli utenti possono caricare dataset CSV, selezionare l'algoritmo (es. Logistic Regression) e monitorare in tempo reale lo stato del job di addestramento.

Gestione Modelli: Un sistema di Model Switching intelligente, visibile tramite un badge persistente nell'header, permette di commutare istantaneamente tra il Modello di Default (System) e l'ultimo Modello Custom addestrato dall'utente, mantenendo lo stato tra le sessioni.

Inferenza e Analisi: Supporta predizioni su singoli prodotti o elaborazioni batch asincrone su grandi file CSV. I risultati sono visualizzati nella Results Card, che offre metriche dettagliate come lo score di confidenza, il "gap" tra le classi e le alternative Top-K,.

Data Visualization: Include grafici a barre CSS-only per la confidenza e dashboard riepilogative per i job batch, con funzionalità di export dei risultati in formato CSV.
