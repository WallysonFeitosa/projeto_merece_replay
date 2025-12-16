document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();

    // Verifica em qual página estamos para rodar o script correto
    if (document.getElementById('tutorial-grid')) {
        initAuthModal();
    } else if (document.getElementById('registration-form')) {
        initRegistration();
    } else if (document.getElementById('video-grid')) {
        initDashboard();
    } else if (document.getElementById('profile-form')) {
        initProfile();
    }
});

// Funcionalidade 3: Modal de Login/Cadastro
function initAuthModal() {
    const modal = document.getElementById('auth-modal');
    const loginBtn = document.querySelector('.login-btn'); // Pode ser o botão de login ou "Meus Vídeos" se logado
    const closeBtn = document.querySelector('.close-modal');
    
    // Elementos de navegação interna do modal

    // Abrir Modal (Apenas se for o botão de login original com href="#")
    if (loginBtn && loginBtn.getAttribute('href') === '#') {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    }

    // Login Simulado (Formulário)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-pass').value;

            // Busca usuários no "Banco de Dados" (localStorage)
            const usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];
            
            const user = usersDB.find(u => u.email === email && u.password === pass);

            if (user) {
                // Login com sucesso
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.reload();
            } else {
                // Spam de erro
                alert('DADOS INCORRETOS! Verifique seu e-mail ou senha.');
            }
        });
    }

    // Fechar Modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Menu Mobile (Responsividade extra)
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

function checkLoginState() {
    const currentUserData = localStorage.getItem('currentUser');
    const userActions = document.querySelector('.user-actions');
    
    // Lógica para a Home (Index) - Se logado, troca botão de Login por Meus Vídeos + Sair
    if (currentUserData && userActions && !document.getElementById('video-grid')) {
        const user = JSON.parse(currentUserData);
        
        userActions.innerHTML = `
            <span class="welcome-msg">Olá, ${user.name.split(' ')[0]}</span>
            <a href="perfil.html" class="login-btn" style="margin-right: 10px;"><i class="fas fa-user-cog"></i> PERFIL</a>
            <a href="#" class="login-btn" id="logout-btn"><i class="fas fa-sign-out-alt"></i> SAIR</a>
        `;
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.reload();
            });
        }

        // Altera o texto do link de Preços
        const pricingLink = document.querySelector('.nav-links a[href="#pricing-section"]');
        if (pricingLink) {
            pricingLink.textContent = 'Alterar Plano';
        }

        // Altera a Call to Action na Hero Section
        const callToAction = document.querySelector('.call-to-action');
        if (callToAction) {
            callToAction.innerHTML = `
                <a href="dashboard.html" class="btn primary-btn">VER MEUS VÍDEOS</a>
                <a href="perfil.html" class="btn secondary-btn">CADASTRAR CAMPO</a>
            `;
        }

        // Lógica da Seção de Preços (Alterar Plano)
        const pricingTitle = document.querySelector('#pricing-section .section-title');
        if (pricingTitle) {
            pricingTitle.textContent = 'Alterar Plano';
            
            const pricingButtons = document.querySelectorAll('.pricing-card button');
            pricingButtons.forEach(btn => {
                const onclickAttr = btn.getAttribute('onclick');
                if (onclickAttr && onclickAttr.includes('cadastro.html')) {
                    // Extrair parametros da URL no onclick original
                    const params = new URLSearchParams(onclickAttr.split('?')[1].replace("'", ""));
                    const plan = params.get('plan');
                    const price = params.get('price');
                    
                    btn.removeAttribute('onclick');
                    btn.textContent = 'MUDAR PARA ESTE';
                    btn.addEventListener('click', () => openPlanModal(plan, price));
                }
            });
        }
    }

    // Lógica Global de Logout (para o Dashboard)
    const globalLogoutBtn = document.querySelector('.logout-btn');
    if (globalLogoutBtn) {
        globalLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
        });
    }
    
    // Atualiza nome no Dashboard se estiver lá
    const dashWelcome = document.querySelector('.dashboard-container .welcome-msg'); // Seletor hipotético ou via header comum
    const headerWelcome = document.querySelector('.navbar .welcome-msg');
    if (currentUserData && headerWelcome) {
        const user = JSON.parse(currentUserData);
        headerWelcome.textContent = `Olá, ${user.name}`;
    }
}

function openPlanModal(plan, price) {
    const modal = document.getElementById('plan-modal');
    document.getElementById('new-plan-name').textContent = plan;
    document.getElementById('new-plan-price').textContent = `R$ ${price}`;
    
    // Configurar botão de confirmar (Clonando para remover listeners antigos)
    const confirmBtn = document.getElementById('confirm-plan-btn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        updateUserPlan(plan);
    });

    // Configurar botões de fechar
    const closeModal = () => modal.classList.remove('active');
    document.getElementById('close-plan-modal').onclick = closeModal;
    document.getElementById('cancel-plan-btn').onclick = closeModal;
    
    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
    
    modal.classList.add('active');
}

function updateUserPlan(newPlan) {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
        const user = JSON.parse(currentUserData);
        user.plan = newPlan;
        
        // Atualiza no "Banco de Dados" e Sessão
        updateUserInDB(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        alert(`Plano alterado para ${newPlan} com sucesso!`);
        document.getElementById('plan-modal').classList.remove('active');
        window.location.reload();
    }
}

// -------------------------------------------------
// LÓGICA DE CADASTRO (cadastro.html)
// -------------------------------------------------

function initRegistration() {
    // Verifica se há um plano selecionado na URL
    const urlParams = new URLSearchParams(window.location.search);
    const planName = urlParams.get('plan');
    const planPrice = urlParams.get('price');

    if (planName && planPrice) {
        const planContainer = document.getElementById('selected-plan-container');
        const planDetails = document.getElementById('selected-plan-details');
        if (planContainer && planDetails) {
            planContainer.style.display = 'block';
            planDetails.textContent = `${planName} - R$ ${planPrice}`;
        }
    }

    const form = document.getElementById('registration-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('reg-name').value;
        const cpf = document.getElementById('reg-cpf').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const pass = document.getElementById('reg-pass').value;
        const confirm = document.getElementById('reg-confirm').value;

        // Validação de Senha
        if (pass !== confirm) {
            alert('As senhas não coincidem!');
            return;
        }

        // Cria objeto do usuário
        const newUser = { name, cpf, email, phone, password: pass, plan: planName || 'Nenhum' };

        // Salva no "Banco de Dados" (Array no localStorage)
        const usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];
        usersDB.push(newUser);
        localStorage.setItem('usersDB', JSON.stringify(usersDB));

        // Loga automaticamente
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        alert('Cadastro realizado com sucesso!');
        window.location.href = 'index.html';
    });
}

// -------------------------------------------------
// LÓGICA DO DASHBOARD (dashboard.html)
// -------------------------------------------------

let allVideos = [];
let currentDashboardDate = new Date();

async function initDashboard() {
    await loadUserVideos();
    initCalendarSelects();
    renderCalendar();
}

function initCalendarSelects() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Popula Meses
    monthNames.forEach((name, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = name;
        monthSelect.appendChild(option);
    });

    // Popula Anos (Ex: 3 anos antes e 2 depois do atual)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 3; i <= currentYear + 2; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // Listeners
    monthSelect.addEventListener('change', (e) => {
        currentDashboardDate.setMonth(parseInt(e.target.value));
        renderCalendar();
    });

    yearSelect.addEventListener('change', (e) => {
        currentDashboardDate.setFullYear(parseInt(e.target.value));
        renderCalendar();
    });
}

async function loadUserVideos() {
    const container = document.getElementById('video-grid');
    container.innerHTML = '<p>Carregando vídeos...</p>';

    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        if (data.user_videos) {
            allVideos = data.user_videos;
            renderVideos(allVideos); // Renderiza todos inicialmente
        }
    } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
        container.innerHTML = '<p>Erro ao carregar seus vídeos.</p>';
    }
}

function renderVideos(videos) {
    const container = document.getElementById('video-grid');
    container.innerHTML = '';

    if (videos.length === 0) {
        container.innerHTML = '<p>Nenhum vídeo encontrado para esta data.</p>';
        return;
    }

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        // Usando a imagem do JSON ou um fallback
        const bgImage = video.thumbnail ? `url(${video.thumbnail})` : 'linear-gradient(45deg, #333, #444)';

        card.innerHTML = `
            <div class="video-thumbnail" style="background-image: ${bgImage}">
                <i class="fas fa-play play-icon"></i>
            </div>
            <div class="video-info">
                <div class="video-date"><i class="far fa-calendar-alt"></i> ${formatDate(video.date)} - ${video.time}</div>
                <div class="video-title">${video.location}</div>
                <div class="video-meta">
                    <small>Duração: ${video.duration}</small>
                    <button class="download-btn" onclick="event.stopPropagation(); alert('Baixando vídeo de ${video.location}...')">
                        <i class="fas fa-download"></i> Baixar
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = ''; // Limpa o grid para renderizar o novo mês

    const year = currentDashboardDate.getFullYear();
    const month = currentDashboardDate.getMonth();

    // Atualiza os selects para refletir a data atual
    document.getElementById('month-select').value = month;
    document.getElementById('year-select').value = year;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dayBtn = document.createElement('div');
        dayBtn.className = 'calendar-day';
        dayBtn.textContent = i;
        
        // Formata dia para comparar com JSON (ex: 2023-10-05)
        const currentDayStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        
        // Marca dias que têm vídeo
        const hasVideo = allVideos.some(v => v.date === currentDayStr);
        if (hasVideo) dayBtn.classList.add('has-video');

        dayBtn.addEventListener('click', () => {
            // Remove active de todos
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active'));
            dayBtn.classList.add('active');
            
            // Filtra vídeos
            const filtered = allVideos.filter(v => v.date === currentDayStr);
            renderVideos(filtered);
            
            document.getElementById('video-section-title').textContent = filtered.length > 0 
                ? `Vídeos de ${i}/10` 
                : `Sem vídeos em ${i}/10`;
        });

        grid.appendChild(dayBtn);
    }
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', options);
}

// -------------------------------------------------
// LÓGICA DE PERFIL (perfil.html)
// -------------------------------------------------

function initProfile() {
    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(currentUserData);

    // Preencher formulário
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-cpf').value = user.cpf || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-phone').value = user.phone || '';
    document.getElementById('profile-plan').value = user.plan || 'Nenhum';

    // Renderizar campos cadastrados
    renderFields(user);

    // Salvar Alterações de Perfil
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        user.name = document.getElementById('profile-name').value;
        user.cpf = document.getElementById('profile-cpf').value;
        user.phone = document.getElementById('profile-phone').value;
        user.plan = document.getElementById('profile-plan').value;

        updateUserInDB(user);
        alert('Dados atualizados com sucesso!');
        window.location.reload(); // Recarrega para atualizar header se nome mudou
    });

    // Toggle Formulário de Novo Campo
    const btnAddField = document.getElementById('btn-add-field');
    const formContainer = document.getElementById('new-field-form-container');
    
    btnAddField.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        btnAddField.innerHTML = formContainer.style.display === 'none' 
            ? '<i class="fas fa-plus"></i> CADASTRAR NOVO CAMPO' 
            : '<i class="fas fa-times"></i> CANCELAR';
    });

    // Cadastrar Novo Campo
    document.getElementById('field-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fieldName = document.getElementById('field-name').value;
        const fieldAddress = document.getElementById('field-address').value;

        if (!user.fields) user.fields = [];
        
        user.fields.push({
            name: fieldName,
            address: fieldAddress,
            id: Date.now()
        });

        updateUserInDB(user);
        alert('Campo cadastrado com sucesso!');
        
        // Limpar e atualizar
        document.getElementById('field-name').value = '';
        document.getElementById('field-address').value = '';
        renderFields(user);
        formContainer.style.display = 'none';
        btnAddField.innerHTML = '<i class="fas fa-plus"></i> CADASTRAR NOVO CAMPO';
    });
}

function updateUserInDB(updatedUser) {
    // Atualiza sessão atual
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Atualiza no "Banco de Dados"
    let usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];
    const index = usersDB.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
        usersDB[index] = updatedUser;
        localStorage.setItem('usersDB', JSON.stringify(usersDB));
    }
}

function renderFields(user) {
    const fields = user.fields || [];
    const container = document.getElementById('fields-list');
    container.innerHTML = '';

    if (fields.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">Nenhum campo cadastrado ainda.</p>';
        return;
    }

    fields.forEach(field => {
        const item = document.createElement('div');
        item.className = 'field-item';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4>${field.name}</h4>
                    <p><i class="fas fa-map-marker-alt" style="color: var(--color-orange)"></i> ${field.address}</p>
                </div>
                <button class="delete-field-btn" style="background: none; border: none; color: #ff4444; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        item.querySelector('.delete-field-btn').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este campo?')) {
                user.fields = user.fields.filter(f => f.id !== field.id);
                updateUserInDB(user);
                renderFields(user);
            }
        });

        container.appendChild(item);
    });
}
// Nota: Para o menu funcionar, seria necessário adicionar um botão hamburguer no HTML, 
// mas o foco aqui foram as sessões solicitadas.