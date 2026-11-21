# Dokumentacja Projektu: SenAsistant (Sen - Licznik Kruków)

## Nazwa kursu
**Testowanie i Jakość Oprogramowania**

## Autor
**Krzysztof Łyszczarz**  
*Adres e-mail:* klyszczarz03@gmail.com

---

## Temat projektu
**SenAssistant - Aplikacja mobilna do zarządzania rozgrywką i rejestrowania wyników w grach karcianych**

---

## Opis projektu
**SenAsistant** („Sen - Licznik Kruków”) to dedykowana aplikacja mobilna stworzona z myślą o ułatwieniu i uatrakcyjnieniu rozgrywki w popularną grę karcianą **„Sen”** (autorstwa Gamewright / polskie wydanie: Wydawnictwo Nasza Księgarnia). 

Gra karciana „Sen” polega na tworzeniu krain snów o jak najniższej wartości punktowej (symbolizowanej przez kruki). Rozgrywka wymaga skrupulatnego notowania wyników i stosowania specjalnych reguł kończenia rund, co w tradycyjnej formie na kartce papieru bywa uciążliwe i podatne na błędy. Aplikacja SenAsistant w pełni automatyzuje proces prowadzenia punktacji, pilnuje przestrzegania zasad gry, zarządza kolejnością graczy i archiwizuje historię partii.

### Główne funkcjonalności aplikacji:
- **Konfiguracja nowej gry:** Definiowanie liczby graczy (od 2 do 8), nadawanie imion, wybór kolorów awatarów oraz definiowanie docelowej liczby punktów (domyślnie 100 kruków).
- **Zarządzanie graczami:** Automatyczne zapamiętywanie profili graczy w pamięci urządzenia z możliwością szybkiego dodawania ich do kolejnych rozgrywek.
- **Wprowadzanie i automatyczne przeliczanie punktacji rundy:** Formularz wprowadzania surowej liczby kruków zebranych przez poszczególnych graczy.
- **Implementacja reguły „Budzimy się!” (Wake Up):**
  - Gracz wywołujący pobudkę z najniższą (lub ex aequo najniższą) liczbą punktów zostaje nagrodzony wynikiem **0 punktów** w danej rundzie.
  - W razie nieudanej pobudki (gdy przynajmniej jeden z rywali ma tyle samo lub mniej punktów) gracz otrzymuje karę: **własne punkty powiększone o +5 punktów karnych**.
- **Wskaźnik tury i pierwszego gracza:** System automatycznie wyznacza i prezentuje kolejność graczy w rundzie oraz wskazuje gracza rozpoczynającego (z możliwością ręcznej zmiany startera).
- **Tablica wyników i ranking na żywo:** Przejrzysta wizualizacja pozycji każdego gracza, sumy zdobytych punktów oraz wskaźników lidera (najmniej punktów) i gracza zagrożonego przegraną.
- **Edycja historii rund (Edit Round Modal):** Możliwość korekty błędnie wprowadzonych punktów z poprzednich rund z natychmiastowym przeliczeniem całego stanu gry.
- **Panel Mistrza Gry (Game Master Modal):** Narzędzie umożliwiające dynamiczną zmianę progu punktowego (target score), edycję imion oraz usunięcie gracza w trakcie trwającej partii.
- **Historia rozgrywek i rewanże:** Zapis zakończonych gier w trwałej pamięci lokalnej wraz z możliwością przeglądu szczegółów każdej rundy oraz natychmiastowego uruchomienia rewanżu z zachowaniem składu.
- **Nowoczesny design i responsywność:** Interfejs zaprojektowany w stylu *Dark Glassmorphism* z gradientami, animacjami, wsparciem dla haptic feedback (sprzężenie dotykowe) oraz dostosowaniem do ekranów o różnych proporcjach.

---

## Uruchomienie projektu

Projekt został zbudowany z wykorzystaniem środowiska **Expo** i **React Native**. Można go uruchomić bezpośrednio na telefonie za pomocą aplikacji **Expo Go**, na emulatorze (Android Studio / iOS Simulator) lub w przeglądarce internetowej.

### Wymagania wstępne:
- Zainstalowane środowisko **Node.js** (wersja zalecana: LTS >= 20.x).
- Menedżer pakietów **npm** (lub yarn / pnpm).
- Aplikacja **Expo Go** zainstalowana na urządzeniu mobilnym (dostępna w [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) oraz [App Store](https://apps.apple.com/app/expo-go/id982107779)) lub skonfigurowany emulator Android / iOS.

### Instrukcja krok po kroku:

1. **Sklonowanie repozytorium i przejście do katalogu projektu:**
   ```bash
   git clone <URL_REPOZYTORIUM>
   cd SenAsistant
   ```

2. **Instalacja zależności projektu:**
   ```bash
   npm install
   ```

3. **Uruchomienie serwera deweloperskiego Expo:**
   ```bash
   npm start
   # lub alternatywnie:
   npx expo start
   ```

4. **Wybór platformy uruchomienia:**
   - **Fizyczny smartfon (Expo Go):** Zeskanuj kod QR wyświetlony w konsoli terminala (w systemie Android przy użyciu aplikacji Expo Go, w systemie iOS za pomocą systemowej aplikacji Aparat).
   - **Emulator Android:** Naciśnij klawisz `a` w oknie terminala lub wykonaj:
     ```bash
     npm run android
     ```
   - **Symulator iOS (wyłącznie macOS):** Naciśnij klawisz `i` w oknie terminala lub wykonaj:
     ```bash
     npm run ios
     ```
   - **Przeglądarka internetowa:** Naciśnij klawisz `w` w oknie terminala lub wykonaj:
     ```bash
     npm run web
     ```

---

## Testy
> *(Opis testów jednostkowych, integracyjnych z odnośnikami do lokalizacji w projekcie)*
>
> **Status:** Sekcja przygotowana na przyszłe implementacje testów w ramach kursu Testowanie i Jakość Oprogramowania.

---

## Dokumentacja API

Architektura aplikacji **SenAsistant** opiera się na modelu *offline-first* i *client-side architecture*. Wewnętrzne interfejsy programistyczne (API) zostały podzielone na warstwę logiki domenowej, warstwę stanu (Context API) oraz warstwę persystencji danych (Storage API).

### 1. Game State Transitions API (`src/utils/gameStateTransitions.ts`)
Zestaw czystych funkcji funkcyjnych odpowiedzialnych za przejścia pomiędzy stanami rozgrywki:
- `createPlayersFromInputs(playerInputs: PlayerInput[], timestamp?: number): Player[]`  
  Mapuje dane wejściowe użytkownika na pełnoprawne obiekty graczy z unikalnymi identyfikatorami i kolorami.
- `createNewGame(players: Player[], targetScore?: number, timestamp?: number): Game`  
  Tworzy nowy obiekt gry z pustą listą rund i statusem `isFinished: false`.
- `addRoundToGame(game: Game, rawScores: Record<string, number>, startingPlayerId?: string, wakeUpCallerId?: string, timestamp?: number): Game`  
  Dodaje nową rundę, wylicza punkty z uwzględnieniem pobudki i sprawdza warunki zakończenia gry.
- `updateRoundInGame(game: Game, roundNumber: number, rawScores: Record<string, number>, wakeUpCallerId?: string): Game`  
  Dokonuje edycji istniejącej rundy i aktualizuje końcowy status gry.
- `createRematchGame(finishedGame: Game, timestamp?: number): Game`  
  Inicjuje nową partię z zachowaniem graczy i parametrów z poprzedniej gry.
- `updateGameSettings(game: Game, newTargetScore: number, playerNamesById: Record<string, string>): Game`  
  Modyfikuje próg punktowy oraz imiona graczy w aktywnej grze.
- `removePlayerFromGame(game: Game, playerId: string): Game`  
  Usuwa wybranego gracza i usuwa jego wyniki ze wszystkich rund.

### 2. Context & State API (`src/context/GameContext.tsx`)
Interfejs stanu globalnego udostępniany komponentom za pomocą hooka `useGame()`:
- `currentGame: Game | null` – aktualnie prowadzona rozgrywka.
- `history: Game[]` – lista historycznych gier wczytana z pamięci trwałej.
- `savedPlayers: Player[]` – lista graczy zapisana do ponownego wykorzystania.
- `isLoading: boolean` – flaga informująca o procesie wczytywania danych z dysku.
- `startNewGame(playerInputs: PlayerInput[], targetScore?: number): Promise<Game>` – utworzenie nowej partii.
- `submitRound(rawScores: Record<string, number>, startingPlayerId?: string, wakeUpCallerId?: string): Promise<void>` – zatwierdzenie wyników rundy.
- `editRoundScore(roundNumber: number, rawScores: Record<string, number>, wakeUpCallerId?: string): Promise<void>` – edycja wybranej rundy.
- `deletePlayerFromGame(playerId: string): Promise<void>` – usunięcie gracza w trakcie rozgrywki.
- `deleteCurrentGame(): Promise<void>` – zresetowanie/porzucenie bieżącej partii.
- `deleteHistoryGame(gameId: string): Promise<void>` – usunięcie wybranej partii z historii.
- `rematchSamePlayers(): Promise<Game | null>` – uruchomienie rewanżu.
- `updateGameSettings(newTargetScore: number, playerNamesById: Record<string, string>): Promise<void>` – zmiana ustawień aktywnej partii.

### 3. Storage API (`src/storage/gameStorage.ts`)
Interfejs asynchronicznej obsługi pamięci trwałej urządzenia (`AsyncStorage`):
- `saveCurrentGame(game: Game | null): Promise<void>` – persystencja aktywnej gry.
- `loadCurrentGame(): Promise<Game | null>` – odczyt aktywnej gry po ponownym uruchomieniu aplikacji.
- `saveGameToHistory(game: Game): Promise<void>` – dopisanie zakończonej gry do archiwum.
- `loadGameHistory(): Promise<Game[]>` – pobranie listy gier z archiwum.
- `deleteGameFromHistory(gameId: string): Promise<Game[]>` – usunięcie rekordu historii.
- `saveSavedPlayers(players: Player[]): Promise<void>` – zapis listy graczy.
- `loadSavedPlayers(): Promise<Player[]>` – odczyt listy graczy.

---

## Przypadki testowe dla testera manualnego (TestCase)
> *(Przypadki testowe dla testera manualnego)*
>
> **Status:** Sekcja przygotowana na specyfikację scenariuszy testowych w ramach zadań kursowych.

---

## Technologie użyte w projekcie

- **Platforma i Framework bazowy:**
  - [React Native](https://reactnative.dev/) (wersja `0.86.3`)
  - [React](https://react.dev/) (wersja `19.2.3`)
  - [Expo SDK](https://expo.dev/) (wersja `~57.0.22`)
- **Język programowania:**
  - [TypeScript](https://www.typescriptlang.org/) (wersja `~6.0.3`)
- **Zarządzanie stanem i przechowywanie danych:**
  - React Context API oraz Custom Hooks (`useGame`)
  - [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) (wersja `2.2.0`)
- **Interfejs użytkownika i stylizacja:**
  - [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) (`~57.0.2`)
  - [Lucide Icons](https://lucide.dev/) (`lucide-react-native` `^1.45.0`)
  - [React Native SVG](https://github.com/software-mansion/react-native-svg) (`15.15.4`)
  - Dedykowany system projektowy (Design Tokens: `COLORS`, `GRADIENTS`, `SHADOWS`) w stylu *Dark Glassmorphism*
- **Sprzężenie zwrotne i integracja systemowa:**
  - [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) (`~57.0.3`) – obsługa haptyki przy interakcjach
  - [Expo Splash Screen](https://docs.expo.dev/versions/latest/sdk/splash-screen/) (`~57.0.9`)
  - [Expo Status Bar](https://docs.expo.dev/versions/latest/sdk/status-bar/) (`~57.0.1`)
