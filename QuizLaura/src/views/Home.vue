<template>
  <div class="quiz-laura-app">
    <!-- TELA 1: HOME -->
    <transition name="fade-scale" mode="out-in">
      <div v-if="currentScreen === 'home'" class="screen home-screen" key="home">
        <div class="home-content">
          <div class="logo-container">
            <div class="logo-icon">🎯</div>
            <div class="logo-ring"></div>
            <div class="logo-ring delay-1"></div>
            <div class="logo-ring delay-2"></div>
          </div>
          <h1 class="app-title">QuizLaura</h1>
          <p class="app-subtitle">Desafie seus conhecimentos em matemática</p>
          
          <div class="home-buttons">
            <button class="btn-start-main" @click="goToSetup">
              <span class="btn-icon">▶</span>
              <span>Começar</span>
            </button>
            <button class="btn-ranking-home" @click="showRanking = true">
              <span class="btn-icon">🏆</span>
              <span>Ranking</span>
            </button>
          </div>
        </div>
        
        <div class="floating-shapes">
          <span v-for="n in 6" :key="n" class="shape" :class="`shape-${n}`">
            {{ ['➕', '➖', '✖', '➗', '√', 'π'][n-1] }}
          </span>
        </div>
      </div>
    </transition>

    <!-- TELA 2: SETUP - DESIGN PREMIUM -->
    <transition name="slide-up" mode="out-in">
      <div v-if="currentScreen === 'setup'" class="screen setup-screen" key="setup">
        <div class="setup-container">
          <!-- Lado Esquerdo - Ilustração -->
          <div class="setup-illustration">
            <div class="illustration-content">
              <div class="math-symbols">
                <span class="symbol float-1">∑</span>
                <span class="symbol float-2">π</span>
                <span class="symbol float-3">√</span>
                <span class="symbol float-4">∞</span>
                <span class="symbol float-5">∫</span>
              </div>
              <div class="illustration-text">
                <h3>Pronto para o desafio?</h3>
                <p>Configure seu jogo e mostre suas habilidades matemáticas!</p>
              </div>
              <div class="feature-list">
                <div class="feature-item">
                  <span class="feature-icon">📊</span>
                  <span>10 questões desafiadoras</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">⏱️</span>
                  <span>3 níveis de dificuldade</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🏅</span>
                  <span>Competição no ranking</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Lado Direito - Formulário -->
          <div class="setup-form-wrapper">
            <div class="setup-form">
              <button class="btn-back" @click="goToHome">
                <span>←</span>
                <span>Voltar</span>
              </button>
              
              <div class="form-header">
                <div class="form-icon">⚙️</div>
                <h2 class="form-title">Configurar Jogo</h2>
                <p class="form-subtitle">Personalize sua experiência</p>
              </div>

              <!-- Nome -->
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">👤</span>
                  Nome do Jogador
                </label>
                <div class="input-wrapper">
                  <input 
                    v-model="playerName" 
                    type="text" 
                    placeholder="Digite seu nome ou do grupo..."
                    class="form-input"
                    maxlength="25"
                    @keyup.enter="startQuiz"
                  >
                  <div class="input-focus-border"></div>
                </div>
                <span class="input-hint">Máximo 25 caracteres</span>
              </div>

              <!-- Dificuldade -->
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">🎮</span>
                  Nível de Dificuldade
                </label>
                <div class="difficulty-cards">
                  <button 
                    v-for="level in difficulties" 
                    :key="level.id"
                    :class="['diff-card', `diff-${level.id}`, { active: selectedDifficulty === level.id }]"
                    @click="selectedDifficulty = level.id"
                  >
                    <div class="diff-card-header">
                      <span class="diff-emoji">{{ level.icon }}</span>
                      <div v-if="selectedDifficulty === level.id" class="diff-check">
                        <span>✓</span>
                      </div>
                    </div>
                    <div class="diff-card-body">
                      <h4 class="diff-name">{{ level.name }}</h4>
                      <p class="diff-desc">{{ level.description }}</p>
                    </div>
                    <div class="diff-card-footer">
                      <span class="time-tag">
                        <span class="time-icon">⏱</span>
                        {{ level.time > 0 ? level.time + 's' : 'Livre' }}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Preview da seleção -->
              <div class="selection-preview" v-if="playerName">
                <div class="preview-item">
                  <span class="preview-label">Jogador:</span>
                  <span class="preview-value player">{{ playerName }}</span>
                </div>
                <div class="preview-divider"></div>
                <div class="preview-item">
                  <span class="preview-label">Modo:</span>
                  <span class="preview-value mode" :class="selectedDifficulty">
                    {{ currentDifficulty.icon }} {{ currentDifficulty.name }}
                  </span>
                </div>
              </div>

              <button 
                class="btn-start-game" 
                @click="startQuiz"
                :disabled="!playerName.trim()"
                :class="{ 'ready': playerName.trim() }"
              >
                <span class="btn-text">{{ playerName.trim() ? 'Iniciar Quiz!' : 'Digite seu nome' }}</span>
                <span class="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- TELA 3: QUIZ -->
    <transition name="slide-left" mode="out-in">
      <Quiz
        v-if="currentScreen === 'quiz'"
        key="quiz"
        :player-name="playerName"
        :difficulty="selectedDifficulty"
        :difficulty-config="currentDifficulty"
        @finish="handleQuizFinish"
        @exit="goToHome"
      />
    </transition>

    <!-- TELA 4: RESULTADOS -->
    <transition name="scale-in" mode="out-in">
      <div v-if="currentScreen === 'results'" class="screen results-screen" key="results">
        <div class="results-card">
          <div class="results-header">
            <div class="trophy" :class="trophyClass">
              {{ trophyEmoji }}
            </div>
            <h2 class="results-title">Quiz Finalizado!</h2>
            <p class="player-result-name">👤 {{ playerName }}</p>
          </div>
          
          <div class="score-circle">
            <div class="score-content">
              <span class="score-number">{{ finalScore }}</span>
              <span class="score-divider">/</span>
              <span class="score-total">10</span>
            </div>
          </div>

          <div class="difficulty-result" :class="`result-${selectedDifficulty}`">
            <span class="result-icon">{{ currentDifficulty.icon }}</span>
            <span class="result-text">Nível {{ currentDifficulty.name }}</span>
          </div>

          <p class="results-message">{{ resultMessage }}</p>

          <div class="stats-row">
            <div class="stat-item correct">
              <span class="stat-icon">✓</span>
              <span class="stat-number">{{ finalCorrect }}</span>
              <span class="stat-label">Acertos</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item wrong">
              <span class="stat-icon">✗</span>
              <span class="stat-number">{{ finalWrong }}</span>
              <span class="stat-label">Erros</span>
            </div>
          </div>

          <div class="results-actions">
            <button class="btn-gabarito" @click="showGabarito = true">
              📋 Ver Gabarito
            </button>
            <button class="btn-restart" @click="restartQuiz">
              🔄 Jogar Novamente
            </button>
            <button class="btn-ranking" @click="showRanking = true">
              🏆 Ver Ranking
            </button>
            <button class="btn-home" @click="goToHome">
              🏠 Menu Principal
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- MODAL DO RANKING (Componente) -->
    <Ranking 
      :show="showRanking" 
      @close="showRanking = false"
      :current-player="playerName"
    />

    <!-- MODAL DO GABARITO -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showGabarito" class="modal-overlay" @click.self="showGabarito = false">
          <div class="modal-content gabarito-modal">
            <div class="modal-header">
              <h3 class="modal-title">📋 Gabarito Completo</h3>
              <button class="btn-close" @click="showGabarito = false">×</button>
            </div>
            
            <div class="gabarito-list">
              <div 
                v-for="(item, index) in quizHistory" 
                :key="index"
                :class="['gabarito-item', { 'correct': item.userAnswer === item.correctAnswer }]"
              >
                <div class="gabarito-number">{{ index + 1 }}</div>
                <div class="gabarito-question" v-html="item.question"></div>
                <div class="gabarito-answer">
                  <span class="answer-label">Resposta:</span>
                  <span class="answer-letter">{{ item.correctAnswer.toUpperCase() }}</span>
                  <span class="answer-text">{{ item.correctText }}</span>
                </div>
                <div v-if="item.userAnswer" class="user-answer">
                  <span class="user-label">Você respondeu:</span>
                  <span :class="['user-letter', item.userAnswer === item.correctAnswer ? 'right' : 'wrong']">
                    {{ item.userAnswer.toUpperCase() }}
                  </span>
                </div>
                <div v-else class="user-answer timeout">
                  <span class="user-label">⏰ Tempo esgotado</span>
                </div>
              </div>
            </div>

            <div class="gabarito-summary">
              <div class="summary-item">
                <span class="summary-label">Acertos:</span>
                <span class="summary-value correct">{{ finalCorrect }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Erros:</span>
                <span class="summary-value wrong">{{ finalWrong }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Nota:</span>
                <span class="summary-value">{{ ((finalScore / 10) * 10).toFixed(1) }}</span>
              </div>
            </div>

            <button class="btn-modal" @click="showGabarito = false">Fechar</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Quiz from '../components/Quiz.vue'
import Ranking from '../components/Ranking.vue'

const currentScreen = ref('home')
const playerName = ref('')
const selectedDifficulty = ref('easy')
const showGabarito = ref(false)
const showRanking = ref(false)

const finalScore = ref(0)
const finalCorrect = ref(0)
const finalWrong = ref(0)
const quizHistory = ref([])

const difficulties = [
  {
    id: 'easy',
    name: 'Fácil',
    icon: '🌱',
    description: 'Sem pressa, ideal para aprender',
    time: 0
  },
  {
    id: 'medium',
    name: 'Médio',
    icon: '⚡',
    description: 'Desafio com tempo moderado',
    time: 30
  },
  {
    id: 'hard',
    name: 'Difícil',
    icon: '🔥',
    description: 'Velocidade máxima exigida!',
    time: 15
  }
]

const currentDifficulty = computed(() => 
  difficulties.find(d => d.id === selectedDifficulty.value)
)

const trophyEmoji = computed(() => {
  if (finalScore.value >= 8) return '🏆'
  if (finalScore.value >= 6) return '🥈'
  if (finalScore.value >= 4) return '🥉'
  return '📚'
})

const trophyClass = computed(() => {
  if (finalScore.value >= 8) return 'gold'
  if (finalScore.value >= 6) return 'silver'
  return ''
})

const resultMessage = computed(() => {
  const percentage = (finalScore.value / 10) * 100
  if (percentage >= 90) return "Excelente! Você é um gênio! 🌟"
  if (percentage >= 70) return "Muito bom! Domina a matemática! 👏"
  if (percentage >= 50) return "Bom trabalho! Continue praticando! 💪"
  return "Continue estudando! A prática leva à perfeição! 📖"
})

const goToHome = () => {
  currentScreen.value = 'home'
  resetSetup()
}

const goToSetup = () => {
  currentScreen.value = 'setup'
}

const startQuiz = () => {
  if (!playerName.value.trim()) return
  currentScreen.value = 'quiz'
}

const resetSetup = () => {
  playerName.value = ''
  selectedDifficulty.value = 'easy'
  finalScore.value = 0
  finalCorrect.value = 0
  finalWrong.value = 0
  quizHistory.value = []
}

const handleQuizFinish = (results) => {
  finalScore.value = results.score
  finalCorrect.value = results.correct
  finalWrong.value = results.wrong
  quizHistory.value = results.history
  
  // Salvar no ranking (localStorage)
  saveToRanking(results)
  
  currentScreen.value = 'results'
}

const saveToRanking = (results) => {
  const rankingData = JSON.parse(localStorage.getItem('quizRanking') || '[]')
  const newEntry = {
    name: playerName.value,
    score: results.score,
    correct: results.correct,
    wrong: results.wrong,
    difficulty: selectedDifficulty.value,
    date: new Date().toISOString()
  }
  rankingData.push(newEntry)
  // Ordenar por pontuação (maior primeiro)
  rankingData.sort((a, b) => b.score - a.score)
  // Manter apenas top 50
  const top50 = rankingData.slice(0, 50)
  localStorage.setItem('quizRanking', JSON.stringify(top50))
}

const restartQuiz = () => {
  currentScreen.value = 'quiz'
}
</script>

<style scoped>
/* ===== VARIÁVEIS ===== */
.quiz-laura-app {
  --primary: #667eea;
  --primary-dark: #764ba2;
  --primary-light: #a3bffa;
  --success: #48bb78;
  --error: #f56565;
  --warning: #ed8936;
  --bg-dark: #1a1a2e;
  --bg-darker: #16213e;
  --bg-darkest: #0f3460;
  
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 50%, var(--bg-darkest) 100%);
}

.screen {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* ===== HOME SCREEN ===== */
.home-screen {
  flex-direction: column;
  position: relative;
}

.home-content {
  text-align: center;
  z-index: 10;
  animation: fadeInUp 1s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.logo-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 5rem;
  z-index: 10;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.logo-ring {
  position: absolute;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  width: 100%;
  height: 100%;
  animation: ripple 3s infinite;
}

.logo-ring.delay-1 { animation-delay: 1s; width: 130%; height: 130%; left: -15%; top: -15%; }
.logo-ring.delay-2 { animation-delay: 2s; width: 160%; height: 160%; left: -30%; top: -30%; }

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.app-title {
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #a8b2d1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;
  letter-spacing: -2px;
}

.app-subtitle {
  font-size: 1.3rem;
  color: #a8b2d1;
  margin-bottom: 40px;
  font-weight: 300;
}

.home-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-start-main {
  padding: 20px 50px;
  font-size: 1.3rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.btn-start-main:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
}

.btn-ranking-home {
  padding: 20px 40px;
  font-size: 1.2rem;
  font-weight: 700;
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
}

.btn-ranking-home:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
}

.btn-icon {
  font-size: 1.4rem;
}

/* Floating Shapes */
.floating-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  font-size: 2.5rem;
  opacity: 0.15;
  animation: float-shape 20s infinite;
}

.shape-1 { top: 10%; left: 10%; animation-delay: 0s; }
.shape-2 { top: 20%; right: 15%; animation-delay: 3s; }
.shape-3 { bottom: 30%; left: 20%; animation-delay: 6s; }
.shape-4 { bottom: 20%; right: 10%; animation-delay: 9s; }
.shape-5 { top: 60%; left: 5%; animation-delay: 12s; }
.shape-6 { top: 40%; right: 5%; animation-delay: 15s; }

@keyframes float-shape {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(10deg); }
}

/* ===== SETUP SCREEN - PREMIUM DESIGN ===== */
.setup-screen {
  padding: 0;
  background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
}

.setup-container {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  width: 100%;
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
}

/* Lado Esquerdo - Ilustração */
.setup-illustration {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
}

.setup-illustration::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.illustration-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 400px;
}

.math-symbols {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.symbol {
  font-size: 3rem;
  opacity: 0.8;
  animation: float-symbol 3s ease-in-out infinite;
}

.symbol.float-1 { animation-delay: 0s; }
.symbol.float-2 { animation-delay: 0.5s; }
.symbol.float-3 { animation-delay: 1s; }
.symbol.float-4 { animation-delay: 1.5s; }
.symbol.float-5 { animation-delay: 2s; }

@keyframes float-symbol {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.illustration-text h3 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.illustration-text p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.6;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.feature-icon {
  font-size: 1.5rem;
}

/* Lado Direito - Formulário */
.setup-form-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.02);
}

.setup-form {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  animation: slideInRight 0.6s ease;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.btn-back {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #718096;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s;
}

.btn-back:hover {
  color: var(--primary);
  background: #f0f4ff;
}

.form-header {
  text-align: center;
  margin-bottom: 35px;
  padding-top: 20px;
}

.form-icon {
  font-size: 3.5rem;
  margin-bottom: 15px;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.form-subtitle {
  color: #a0aec0;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 30px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-icon {
  font-size: 1.2rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 18px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 1.1rem;
  font-family: inherit;
  background: #f7fafc;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-hint {
  display: block;
  margin-top: 8px;
  font-size: 0.85rem;
  color: #a0aec0;
  margin-left: 5px;
}

/* Difficulty Cards */
.difficulty-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.diff-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px 15px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  position: relative;
}

.diff-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.diff-card.active {
  border-color: var(--primary);
  background: #f0f4ff;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
}

.diff-card.active.diff-easy {
  border-color: var(--success);
  background: #f0fff4;
}

.diff-card.active.diff-medium {
  border-color: var(--warning);
  background: #fffaf0;
}

.diff-card.active.diff-hard {
  border-color: var(--error);
  background: #fff5f5;
}

.diff-card-header {
  position: relative;
  margin-bottom: 15px;
}

.diff-emoji {
  font-size: 2.5rem;
  display: block;
}

.diff-check {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  animation: scaleIn 0.3s ease;
}

.diff-card.active.diff-easy .diff-check { background: var(--success); }
.diff-card.active.diff-medium .diff-check { background: var(--warning); }
.diff-card.active.diff-hard .diff-check { background: var(--error); }

.diff-card-body {
  margin-bottom: 15px;
}

.diff-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 5px;
}

.diff-desc {
  font-size: 0.8rem;
  color: #718096;
  line-height: 1.4;
}

.diff-card-footer {
  margin-top: auto;
}

.time-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  padding: 6px 12px;
  background: #f7fafc;
  border-radius: 20px;
  color: #4a5568;
  font-weight: 600;
}

.time-icon {
  font-size: 0.9rem;
}

/* Selection Preview */
.selection-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e6e9f5 100%);
  border-radius: 14px;
  margin-bottom: 25px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.preview-label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.preview-value {
  font-weight: 700;
  font-size: 1rem;
}

.preview-value.player {
  color: var(--primary);
}

.preview-value.mode {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.preview-value.mode.easy { background: #f0fff4; color: var(--success); }
.preview-value.mode.medium { background: #fffaf0; color: var(--warning); }
.preview-value.mode.hard { background: #fff5f5; color: var(--error); }

.preview-divider {
  width: 1px;
  height: 40px;
  background: #cbd5e0;
}

/* Start Button */
.btn-start-game {
  width: 100%;
  padding: 20px;
  background: #e2e8f0;
  color: #a0aec0;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: not-allowed;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-start-game.ready {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-start-game.ready:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-arrow {
  transition: transform 0.3s;
}

.btn-start-game.ready:hover .btn-arrow {
  transform: translateX(5px);
}

/* ===== RESULTS SCREEN ===== */
.results-screen {
  padding: 20px;
}

.results-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.results-header {
  margin-bottom: 25px;
}

.trophy {
  font-size: 5rem;
  margin-bottom: 15px;
  animation: float 3s ease-in-out infinite;
  display: inline-block;
}

.trophy.gold { filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.6)); }
.trophy.silver { filter: drop-shadow(0 0 20px rgba(192, 192, 192, 0.6)); }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.results-title {
  font-size: 2rem;
  color: #1a1a2e;
  font-weight: 800;
  margin-bottom: 10px;
}

.player-result-name {
  color: #718096;
  font-size: 1.1rem;
  font-weight: 500;
}

.score-circle {
  width: 180px;
  height: 180px;
  margin: 25px auto;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  inset: 8px;
  background: white;
  border-radius: 50%;
}

.score-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.score-number {
  font-size: 4rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}

.score-divider {
  font-size: 2rem;
  color: #a0aec0;
  font-weight: 300;
}

.score-total {
  font-size: 2rem;
  color: #a0aec0;
  font-weight: 600;
}

.difficulty-result {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 25px;
  margin-bottom: 20px;
  font-weight: 600;
}

.result-easy { background: #f0fff4; color: var(--success); }
.result-medium { background: #fffaf0; color: var(--warning); }
.result-hard { background: #fff5f5; color: var(--error); }

.results-message {
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 30px;
  font-weight: 500;
}

.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 35px;
  padding: 25px;
  background: #f7fafc;
  border-radius: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-item.correct .stat-icon { color: var(--success); }
.stat-item.wrong .stat-icon { color: var(--error); }

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
}

.stat-label {
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.stat-divider {
  width: 2px;
  height: 60px;
  background: #e2e8f0;
}

.results-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-gabarito, .btn-restart, .btn-home, .btn-ranking {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-gabarito {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-gabarito:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.btn-restart {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-restart:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-ranking {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
}

.btn-ranking:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(237, 137, 54, 0.4);
}

.btn-home {
  background: transparent;
  color: #718096;
  border: 2px solid #e2e8f0;
}

.btn-home:hover {
  background: #f7fafc;
  color: #4a5568;
  transform: translateY(-2px);
}

/* ===== MODAIS ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 35px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalUp 0.3s ease;
}

@keyframes modalUp {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a2e;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #a0aec0;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #f7fafc;
  color: #1a1a2e;
}

.gabarito-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 10px;
}

.gabarito-item {
  background: #f7fafc;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #e2e8f0;
  transition: all 0.3s;
}

.gabarito-item.correct {
  border-left-color: var(--success);
  background: #f0fff4;
}

.gabarito-number {
  display: inline-flex;
  background: var(--primary);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.gabarito-question {
  font-size: 0.95rem;
  color: #2d3748;
  margin-bottom: 12px;
  line-height: 1.5;
  font-weight: 500;
}

:deep(.gabarito-question .math-expr) {
  background: #e2e8f0;
  color: #1a1a2e;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.gabarito-answer {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.answer-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 600;
}

.answer-letter {
  width: 28px;
  height: 28px;
  background: var(--success);
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.answer-text {
  font-weight: 700;
  color: #22543d;
}

.user-answer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #cbd5e0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-answer.timeout {
  color: var(--error);
  font-weight: 600;
}

.user-label {
  font-size: 0.85rem;
  color: #718096;
}

.user-letter {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
}

.user-letter.right {
  background: var(--success);
  color: white;
}

.user-letter.wrong {
  background: var(--error);
  color: white;
}

.gabarito-summary {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.summary-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 600;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 800;
}

.summary-value.correct { color: var(--success); }
.summary-value.wrong { color: var(--error); }
.summary-value:not(.correct):not(.wrong) { color: var(--primary); }

.btn-modal {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-modal:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* ===== TRANSIÇÕES ===== */
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.5s ease;
}

.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(50px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}

.slide-left-enter-active, .slide-left-leave-active {
  transition: all 0.5s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.scale-in-enter-active, .scale-in-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-in-enter-from, .scale-in-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* ===== RESPONSIVO ===== */
@media (max-width: 1024px) {
  .setup-container {
    grid-template-columns: 1fr;
  }
  
  .setup-illustration {
    display: none;
  }
  
  .setup-form-wrapper {
    padding: 20px;
  }
}

@media (max-width: 640px) {
  .app-title {
    font-size: 3rem;
  }
  
  .difficulty-cards {
    grid-template-columns: 1fr;
  }
  
  .diff-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    text-align: left;
    align-items: center;
    gap: 15px;
  }
  
  .diff-card-header {
    margin-bottom: 0;
  }
  
  .diff-card-body {
    margin-bottom: 0;
  }
  
  .diff-card-footer {
    margin-top: 0;
  }
  
  .diff-desc {
    display: none;
  }
  
  .selection-preview {
    flex-direction: column;
    gap: 15px;
  }
  
  .preview-divider {
    width: 100%;
    height: 1px;
  }
  
  .home-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-start-main, .btn-ranking-home {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }
  
  .stats-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .stat-divider {
    width: 60px;
    height: 2px;
  }
}

@media (max-width: 480px) {
  .setup-form {
    padding: 30px 20px;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .score-circle {
    width: 150px;
    height: 150px;
  }
  
  .score-number {
    font-size: 3rem;
  }
}
</style>