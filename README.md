## Instrukcije za lokalni setup

Pratiti sledeće korake za pokretanje aplikacije na lokalnoj mašini:

### 1. Klonirati repozitorijum

```bash
git clone https://github.com/your-username/TasksTodayFE.git
cd TasksTodayFE
```

### 2. Instalirati dependecy-je

Node.js (verzija 14 ili više).

```bash
npm install
# ili
yarn install
```

### 3. Environment variable

Napraviti `.env` fajl u root-u projekta.

Ovo je primer `.env` fajla:

```
VITE_API_BASE_URL=https:localhost:8000/api
VITE_OTHER_ENV_VAR=value
```

### 4. Pokrenuti server

```bash
npm run dev
# or
yarn dev
```

Aplikacija će biti dostupna na `http://localhost:5173` (ili portu koji je prikazan u konzoli).