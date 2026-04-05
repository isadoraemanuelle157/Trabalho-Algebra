<template>
  <div class="quiz-view">
    <!-- Header -->
    <div class="quiz-top-bar">
      <div class="player-info">
        <span class="player-avatar">👤</span>
        <span class="player-name">{{ playerName }}</span>
      </div>
      <div class="difficulty-badge" :class="`badge-${difficulty}`">
           <component :is="difficultyConfig.icon" size="16" />
        {{ difficultyConfig.name }}
      </div>
      <button class="btn-exit" @click="confirmExit">✕</button>
    </div>

    <!-- Timer -->
    <div v-if="difficulty !== 'easy'" class="timer-bar-container">
      <div 
        class="timer-bar" 
        :class="{ 'warning': timeLeft <= 10, 'danger': timeLeft <= 5 }"
        :style="{ width: (timeLeft / difficultyConfig.time * 100) + '%' }"
      ></div>
      <span class="timer-text" :class="{ 'pulse': timeLeft <= 10 }">
        ⏱ {{ timeLeft }}s
      </span>
    </div>

    <!-- Quiz Card -->
    <div class="quiz-card">
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <span class="progress-text">
          {{ currentQuestionIndex + 1 }} / {{ questions.length }}
        </span>
      </div>

      <div class="question-box">
        <span class="question-label">Questão {{ currentQuestionIndex + 1 }}</span>
        <p class="question-text" v-html="currentQuestion.question"></p>
      </div>

      <div class="options-grid">
        <button
          v-for="(option, key) in currentQuestion.options"
          :key="key"
          :class="[
            'option-btn',
            `option-${key}`,
            {
              'selected': selectedOption === key,
              'correct': showFeedback && key === currentQuestion.correct,
              'wrong': showFeedback && selectedOption === key && key !== currentQuestion.correct,
              'disabled': showFeedback || (difficulty !== 'easy' && timeLeft <= 0)
            }
          ]"
          @click="selectOption(key)"
          :disabled="showFeedback || (difficulty !== 'easy' && timeLeft <= 0)"
        >
          <span class="option-letter">{{ key.toUpperCase() }}</span>
          <span class="option-text">{{ option }}</span>
        </button>
      </div>

      <!-- Feedback com Justificativa -->
      <transition name="slide-up">
        <div v-if="showFeedback" class="feedback-section">
          <div :class="['feedback-header', isCorrect ? 'success' : 'error']">
            <span class="feedback-icon">{{ isCorrect ? '✓' : '✗' }}</span>
            <span class="feedback-title">{{ isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta' }}</span>
          </div>
          
          <div class="feedback-content">
            <div class="correct-answer-box">
              <span class="answer-label">Resposta correta:</span>
              <div class="answer-display">
                <span class="answer-letter">{{ currentQuestion.correct.toUpperCase() }}</span>
                <span class="answer-text">{{ currentQuestion.options[currentQuestion.correct] }}</span>
              </div>
            </div>
            
            <div class="justification-box">
              <span class="justification-label">💡 Explicação:</span>
              <p class="justification-text">{{ currentQuestion.justification }}</p>
            </div>
          </div>
        </div>
      </transition>

      <div v-if="timeExpired && !showFeedback" class="time-expired-msg">
        ⏰ Tempo Esgotado!
      </div>

      <button 
        class="btn-primary"
        @click="nextQuestion"
        :disabled="!showFeedback && !timeExpired"
      >
        {{ isLastQuestion ? 'Finalizar' : 'Próxima Questão →' }}
      </button>
    </div>

    <!-- Modal de Confirmação de Saída -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showExitConfirm" class="modal-overlay" @click.self="showExitConfirm = false">
          <div class="modal-content confirm-modal">
            <div class="modal-icon">⚠️</div>
            <h3 class="modal-title">Sair do Quiz?</h3>
            <p class="modal-text">Seu progresso será perdido. Deseja realmente sair?</p>
            <div class="confirm-buttons">
              <button class="btn-cancel" @click="showExitConfirm = false">Continuar</button>
              <button class="btn-confirm" @click="exitQuiz">Sair</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  playerName: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  difficultyConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['finish', 'exit'])

// Estado
const currentQuestionIndex = ref(0)
const selectedOption = ref(null)
const showFeedback = ref(false)
const isCorrect = ref(false)
const score = ref(0)
const correctAnswers = ref(0)
const wrongAnswers = ref(0)
const showExitConfirm = ref(false)
const userAnswers = ref([])
const quizHistory = ref([])

// Timer
const timeLeft = ref(0)
const timeExpired = ref(false)
let timerInterval = null

// Questões com justificativas
const questions = [
  {
    question: "Quanto é <span class='math-expr'>12 × 8</span>?",
    options: { a: "84", b: "96", c: "108", d: "72" },
    correct: "b",
    justification: "Para multiplicar 12 × 8, podemos fazer (10 × 8) + (2 × 8) = 80 + 16 = 96. Ou simplesmente decorar a tabuada: 12 × 8 = 96."
  },
  {
    question: "Se <span class='math-expr'>x + 5 = 12</span>, qual o valor de x?",
    options: { a: "5", b: "6", c: "7", d: "8" },
    correct: "c",
    justification: "Para isolar o x, subtraímos 5 dos dois lados da equação: x = 12 - 5 = 7. Portanto, x = 7."
  },
  {
    question: "Qual é a raiz quadrada de <span class='math-expr'>144</span>?",
    options: { a: "10", b: "11", c: "12", d: "14" },
    correct: "c",
    justification: "A raiz quadrada de 144 é 12 porque 12 × 12 = 144. É um número quadrado perfeito."
  },
  {
    question: "Quanto é <span class='math-expr'>25% de 200</span>?",
    options: { a: "25", b: "50", c: "75", d: "100" },
    correct: "b",
    justification: "25% equivale a 1/4 ou 0,25. Então 25% de 200 = 0,25 × 200 = 50. Ou 200 ÷ 4 = 50."
  },
  {
    question: "Qual é o próximo número: <span class='math-expr'>2, 6, 12, 20, ...</span>?",
    options: { a: "28", b: "30", c: "32", d: "36" },
    correct: "b",
    justification: "A sequência segue o padrão: n(n+1). Ou seja: 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30. O próximo é 30."
  },
  {
    question: "Triângulo com ângulos <span class='math-expr'>45°</span> e <span class='math-expr'>45°</span>, o terceiro é?",
    options: { a: "45°", b: "60°", c: "90°", d: "100°" },
    correct: "c",
    justification: "A soma dos ângulos internos de um triângulo é sempre 180°. Então: 180° - 45° - 45° = 90°. É um triângulo retângulo isósceles."
  },
  {
    question: "Quanto é <span class='math-expr'>3² + 4²</span>?",
    options: { a: "16", b: "25", c: "36", d: "49" },
    correct: "b",
    justification: "3² = 9 e 4² = 16. Então 9 + 16 = 25. Este é o famoso triplo pitagórico (3, 4, 5), pois 3² + 4² = 5²."
  },
  {
    question: "Qual é o valor de <span class='math-expr'>log₁₀(100)</span>?",
    options: { a: "1", b: "2", c: "10", d: "100" },
    correct: "b",
    justification: "log₁₀(100) pergunta: 10 elevado a qual número dá 100? Como 10² = 100, a resposta é 2."
  },
  {
    question: "Se <span class='math-expr'>f(x) = 2x + 3</span>, qual <span class='math-expr'>f(4)</span>?",
    options: { a: "8", b: "9", c: "10", d: "11" },
    correct: "d",
    justification: "Substituímos x por 4 na função: f(4) = 2(4) + 3 = 8 + 3 = 11."
  },
  {
    question: "Área do círculo com <span class='math-expr'>r = 3</span> (π = 3,14)?",
    options: { a: "18,84", b: "28,26", c: "31,42", d: "37,68" },
    correct: "b",
    justification: "Fórmula da área: A = π × r². Então A = 3,14 × 3² = 3,14 × 9 = 28,26. Não confundir com o perímetro (2πr)!"
  }
]

// Computed
const currentQuestion = computed(() => questions[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.length - 1)
const progressPercentage = computed(() => ((currentQuestionIndex.value + 1) / questions.length) * 100)

// Lifecycle
onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

// Timer
const startTimer = () => {
  if (props.difficulty === 'easy') return
  
  timeLeft.value = props.difficultyConfig.time
  timeExpired.value = false
  
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval)
      timeExpired.value = true
      handleTimeExpired()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const handleTimeExpired = () => {
  wrongAnswers.value++
  showFeedback.value = true
  isCorrect.value = false
  
  // Salvar no histórico
  quizHistory.value.push({
    question: currentQuestion.value.question,
    correctAnswer: currentQuestion.value.correct,
    correctText: currentQuestion.value.options[currentQuestion.value.correct],
    userAnswer: null
  })
}

// Quiz Logic
const selectOption = (option) => {
  if (showFeedback.value || timeExpired.value) return
  
  selectedOption.value = option
  userAnswers.value[currentQuestionIndex.value] = option
  stopTimer()
  checkAnswer()
}

const checkAnswer = () => {
  showFeedback.value = true
  isCorrect.value = selectedOption.value === currentQuestion.value.correct
  
  if (isCorrect.value) {
    score.value++
    correctAnswers.value++
  } else {
    wrongAnswers.value++
  }
  
  // Salvar no histórico
  quizHistory.value.push({
    question: currentQuestion.value.question,
    correctAnswer: currentQuestion.value.correct,
    correctText: currentQuestion.value.options[currentQuestion.value.correct],
    userAnswer: selectedOption.value
  })
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    finishQuiz()
  } else {
    currentQuestionIndex.value++
    resetQuestion()
    startTimer()
  }
}

const resetQuestion = () => {
  selectedOption.value = null
  showFeedback.value = false
  isCorrect.value = false
  timeExpired.value = false
}

const finishQuiz = () => {
  stopTimer()
  emit('finish', {
    score: score.value,
    correct: correctAnswers.value,
    wrong: wrongAnswers.value,
    history: quizHistory.value
  })
}

const confirmExit = () => {
  stopTimer()
  showExitConfirm.value = true
}

const exitQuiz = () => {
  showExitConfirm.value = false
  emit('exit')
}
</script>

<style scoped>
/* Adicionar estilo para o ícone na badge */
.difficulty-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.difficulty-badge svg {
  stroke-width: 2.5;
}

.badge-easy { 
  background: #48bb78; 
  color: white; 
}

.badge-easy svg { color: white; }

.badge-medium { 
  background: #ed8936; 
  color: white; 
}

.badge-medium svg { color: white; }

.badge-hard { 
  background: #f56565; 
  color: white; 
}

.badge-hard svg { color: white; }

.quiz-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.quiz-top-bar {
  width: 100%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.player-avatar {
  font-size: 1.5rem;
}

.player-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.difficulty-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-easy { background: #48bb78; color: white; }
.badge-medium { background: #ed8936; color: white; }
.badge-hard { background: #f56565; color: white; }

.btn-exit {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-exit:hover {
  background: #f56565;
  transform: rotate(90deg);
}

/* Timer */
.timer-bar-container {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #48bb78 100%);
  transition: width 1s linear, background 0.3s;
}

.timer-bar.warning { background: linear-gradient(90deg, #ed8936 0%, #ed8936 100%); }
.timer-bar.danger { background: linear-gradient(90deg, #f56565 0%, #f56565 100%); }

.timer-text {
  position: absolute;
  right: 20px;
  top: 15px;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
}

.timer-text.pulse {
  animation: pulse-text 0.5s infinite;
}

@keyframes pulse-text {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Quiz Card */
.quiz-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-text {
  color: #667eea;
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 50px;
  text-align: right;
}

/* Question Box */
.question-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 35px;
  border-radius: 16px;
  margin-bottom: 25px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.question-box::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.question-label {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
}

.question-text {
  font-size: 1.4rem;
  color: white;
  line-height: 1.6;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

:deep(.math-expr) {
  display: inline-block;
  background: rgba(255,255,255,0.25);
  color: white;
  padding: 4px 12px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  margin: 0 4px;
  border: 1px solid rgba(255,255,255,0.3);
}

/* Options Grid 2x2 */
.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 25px 20px;
  background: white;
  border: 3px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.option-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 5px;
  background: transparent;
  transition: all 0.3s;
}

.option-btn:hover:not(.disabled) {
  border-color: #667eea;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
}

.option-btn.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.option-btn.selected::before {
  background: #667eea;
}

.option-btn.correct {
  border-color: #48bb78;
  background: #f0fff4;
  animation: pulse 0.5s;
}

.option-btn.correct::before {
  background: #48bb78;
}

.option-btn.wrong {
  border-color: #f56565;
  background: #fff5f5;
  animation: shake 0.5s;
}

.option-btn.wrong::before {
  background: #f56565;
}

.option-btn.disabled {
  cursor: not-allowed;
  opacity: 0.9;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.option-letter {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  flex-shrink: 0;
  transition: all 0.3s;
  background: #f7fafc;
  color: #4a5568;
}

.option-a .option-letter { background: #fee2e2; color: #dc2626; }
.option-b .option-letter { background: #d1fae5; color: #059669; }
.option-c .option-letter { background: #fef3c7; color: #d97706; }
.option-d .option-letter { background: #e0e7ff; color: #4f46e5; }

.option-btn.selected .option-letter {
  background: #667eea !important;
  color: white !important;
  transform: scale(1.1);
}

.option-btn.correct .option-letter {
  background: #48bb78 !important;
  color: white !important;
}

.option-btn.wrong .option-letter {
  background: #f56565 !important;
  color: white !important;
}

.option-text {
  font-size: 1.15rem;
  color: #2d3748;
  font-weight: 600;
}

/* Feedback Section com Justificativa */
.feedback-section {
  margin-bottom: 25px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.4s ease;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  font-weight: 700;
  font-size: 1.1rem;
}

.feedback-header.success {
  background: #48bb78;
  color: white;
}

.feedback-header.error {
  background: #f56565;
  color: white;
}

.feedback-icon {
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
}

.feedback-content {
  background: #f7fafc;
  padding: 20px;
}

.correct-answer-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.answer-label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 600;
}

.answer-display {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 8px 16px;
  border-radius: 10px;
  border: 2px solid #48bb78;
}

.answer-letter {
  width: 32px;
  height: 32px;
  background: #48bb78;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
}

.answer-text {
  font-weight: 700;
  color: #22543d;
  font-size: 1.05rem;
}

.justification-box {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.justification-label {
  display: block;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 700;
  margin-bottom: 8px;
}

.justification-text {
  color: #4a5568;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
}

.time-expired-msg {
  text-align: center;
  padding: 15px;
  background: #fff5f5;
  color: #f56565;
  border-radius: 12px;
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 1.1rem;
  border: 2px solid #f56565;
  animation: pulse 1s infinite;
}

.btn-primary {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal de Confirmação */
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
  max-width: 500px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalUp 0.3s ease;
}

@keyframes modalUp {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.confirm-modal {
  text-align: center;
}

.modal-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 10px;
}

.modal-text {
  color: #718096;
  margin-bottom: 25px;
  font-size: 1.05rem;
}

.confirm-buttons {
  display: flex;
  gap: 15px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-cancel {
  background: #f7fafc;
  color: #4a5568;
}

.btn-cancel:hover {
  background: #edf2f7;
}

.btn-confirm {
  background: #f56565;
  color: white;
}

.btn-confirm:hover {
  background: #e53e3e;
  transform: translateY(-2px);
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .option-btn {
    padding: 18px 15px;
  }
  
  .question-box {
    padding: 25px;
  }
  
  .question-text {
    font-size: 1.2rem;
  }
  
  .feedback-content {
    padding: 15px;
  }
  
  .correct-answer-box {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quiz-top-bar {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .player-name {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
    .modal-content {
    transform: translateX(-7px);
    margin: 0;              /* remove centralização problemática */
    width: 100%;
    max-width: 100%;
    padding: 20px 12px;    /* menos espaço lateral */
    border-radius: 12px;
    box-sizing: border-box;
  }

  .modal-overlay {
  box-sizing: border-box;
    margin: 6px 0 5px 2px; /* tira o auto e joga pra esquerda */
    max-width: 95%; 
  }
   .quiz-card {
      box-sizing: border-box;
    margin: 3px 0 2px 10px; /* tira o auto e joga pra esquerda */
    max-width: 95%; /* evita estourar a tela */
  }

  .quiz-view {
    align-items: flex-start; /* garante alinhamento à esquerda */
  }
  .feedback-header {
    padding: 12px 16px;
    font-size: 1rem;
  }
}
</style>