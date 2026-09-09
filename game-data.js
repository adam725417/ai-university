window.GAME_LEVELS = [
  {
    id: 'survival',
    level: 1,
    title: 'AI 生存指數',
    subtitle: '先認識你的 AI 起點',
    icon: '⛰️',
    accent: 'blue',
    intro: '沒有標準答案，這一關只想知道你現在和 AI 有多熟。',
    questions: [
      {
        id: 'ai_frequency', type: 'single', required: true,
        label: '如果把 AI 當成你的學習夥伴，你們現在是什麼關係？',
        options: [
          {value:'幾乎沒有', title:'我們還不太熟', desc:'幾乎不用', icon:'😶'},
          {value:'偶爾使用', title:'偶爾找他幫忙', desc:'每月幾次', icon:'🙂'},
          {value:'每週使用', title:'已經是固定搭檔', desc:'每週使用', icon:'😎'},
          {value:'已經是工作／學習的重要工具', title:'沒有 AI 好像少了什麼', desc:'幾乎每天', icon:'😍'}
        ]
      },
      {
        id: 'build_experience', type: 'single', required: true,
        label: '你曾經自己做過可以實際操作的 AI／程式作品嗎？',
        options: [
          {value:'沒有', title:'還沒開始', desc:'但今天就是起點', icon:'🌱'},
          {value:'跟著教學做過', title:'跟著教學闖過關', desc:'有實作經驗', icon:'🧭'},
          {value:'做過小型作品', title:'自己做過小作品', desc:'已經開始創造', icon:'🛠️'},
          {value:'做過可實際使用的系統', title:'做過可用系統', desc:'實戰玩家', icon:'🚀'}
        ]
      },
      {id:'self_prompt', type:'scale', required:true, label:'Prompt 能力值', prompt:'我能寫出清楚、有效的 Prompt', min:1, max:5, minLabel:'剛起步', maxLabel:'可以教人'},
      {id:'self_arch', type:'scale', required:true, label:'AI 架構能力值', prompt:'我能說明 LLM、RAG、Agent 各自扮演的角色', min:1, max:5, minLabel:'剛起步', maxLabel:'可以教人'},
      {id:'self_api', type:'scale', required:true, label:'API 串接能力值', prompt:'我能透過 API 串接兩個系統', min:1, max:5, minLabel:'剛起步', maxLabel:'可以實作'},
      {id:'self_design', type:'scale', required:true, label:'系統設計能力值', prompt:'我能把一個 AI 想法拆成前端、AI、資料與後端架構', min:1, max:5, minLabel:'剛起步', maxLabel:'可以實作'}
    ]
  },
  {
    id: 'gear', level: 2, title: 'AI 裝備庫', subtitle: '收集你的知識裝備', icon: '🎒', accent: 'yellow',
    intro: '你用過的工具與技術，就是接下來冒險的裝備。',
    questions: [
      {id:'ai_tools', type:'multi-cards', required:false, label:'你使用過哪些工具？', options:[
        ['ChatGPT','萬用型 AI 助手','💬'],['Claude','長文分析師','📚'],['Gemini','Google AI 夥伴','✨'],['Copilot','工作與程式助手','🧑‍💻'],['Perplexity','AI 搜尋者','🔎'],['n8n','自動化串接工具','⚙️'],['AI Coding 工具','AI 程式夥伴','⌨️']
      ], allowOther:true},
      {id:'tech_background', type:'multi-cards', required:false, label:'你的技術背包裡有哪些裝備？', options:[
        ['Python','程式魔法','🐍'],['SQL','資料查詢','🗃️'],['Web 前端／後端','網站開發','🌐'],['API','系統連結','🔌'],['AI／Machine Learning','AI 基礎','🧠'],['Data Analysis','資料分析','📊'],['幾乎沒有程式背景','新手保護符','🌱']
      ], allowOther:true}
    ]
  },
  {
    id: 'arena', level: 3, title: 'AI 知識競技場', subtitle: '挑戰 AI 核心概念', icon: '💡', accent: 'green',
    intro: '不用查資料，憑直覺挑戰。答對會得到 Bonus XP，答錯也會立刻解鎖知識。',
    questions: [
      {id:'concept_genai', type:'quiz', required:true, label:'下列哪一句最接近「生成式 AI」？', options:['只會從資料庫找到既有答案','能依據學到的模式產生新的文字、圖片或程式碼','只能做數字預測','等同於一般搜尋引擎'], answer:'能依據學到的模式產生新的文字、圖片或程式碼', explain:'生成式 AI 的特色，是根據學到的模式產生新的內容，而不只是查找既有答案。'},
      {id:'concept_llm', type:'quiz', required:true, label:'LLM（大型語言模型）最核心的工作，可以白話理解成什麼？', options:['理解與預測語言中的下一個 Token，逐步生成內容','直接連線所有企業資料庫','永久記住每位使用者的所有對話','保證每次回答都正確'], answer:'理解與預測語言中的下一個 Token，逐步生成內容', explain:'白話來說，LLM 會根據上下文預測接下來最可能出現的 Token，持續生成內容。'},
      {id:'concept_hallucination', type:'quiz', required:true, label:'AI「幻覺（Hallucination）」通常是指什麼？', options:['AI 回答速度太慢','AI 產生看似合理但其實錯誤或不存在的內容','AI 無法產生圖片','AI 一定拒絕回答問題'], answer:'AI 產生看似合理但其實錯誤或不存在的內容', explain:'AI 有時會很有自信地生成錯誤內容，所以重要資訊仍需要查證。'},
      {id:'concept_rag', type:'quiz', required:true, label:'企業要讓 AI 依據公司文件回答問題，RAG 最主要扮演什麼角色？', options:['重新訓練一個全新的大型模型','先找出相關資料，再交給模型參考回答','把所有文件直接寫進 Prompt','只用來製作圖片'], answer:'先找出相關資料，再交給模型參考回答', explain:'RAG 的核心是先檢索相關資料，再把資料交給模型生成回答。'},
      {id:'concept_api', type:'quiz', required:true, label:'API 在 AI 系統裡最像什麼？', options:['讓不同系統彼此溝通與交換資料的接口','模型的記憶體','一種資料庫','只有工程師才看得到的畫面'], answer:'讓不同系統彼此溝通與交換資料的接口', explain:'API 就像系統之間約定好的插座與語言，讓不同服務可以互相呼叫。'},
      {id:'concept_agent', type:'quiz', required:true, label:'AI Agent 和一般聊天機器人最大的差別，較接近哪一項？', options:['Agent 可以根據目標規劃步驟、使用工具並執行任務','Agent 一定比所有 LLM 聰明','Agent 不需要任何權限控制','Agent 只能回答固定選項'], answer:'Agent 可以根據目標規劃步驟、使用工具並執行任務', explain:'Agent 的重點不只是回答，而是能圍繞目標規劃、使用工具、採取行動。'}
    ]
  },
  {
    id: 'mission', level: 4, title: 'AI 任務中心', subtitle: '挑戰企業 AI 情境', icon: '📋', accent: 'purple',
    intro: '現在不是背名詞，而是判斷真實系統該怎麼設計。',
    questions: [
      {id:'system_start', type:'quiz', required:true, label:'要做一個企業 AI 系統，最適合先確認什麼？', options:['要解決的問題、使用者與成功標準','先選參數最多的模型','先買 GPU','先做漂亮介面'], answer:'要解決的問題、使用者與成功標準', explain:'技術之前先確認問題、使用者與成功標準，才知道要做什麼、做到什麼程度。'},
      {id:'system_integration', type:'quiz', required:true, label:'如果 AI 要查詢 MES、ERP 或其他企業系統資料，通常需要特別注意什麼？', options:['資料接口、權限與資料格式','只要 Prompt 寫得夠長就可以','只要模型夠大就不需要串接','把所有帳號密碼直接放進前端'], answer:'資料接口、權限與資料格式', explain:'企業 AI 系統真正困難的地方常在資料與系統整合，以及權限與安全。'},
      {id:'system_governance', type:'quiz', required:true, label:'企業導入 AI 時，哪一項做法最符合基本治理原則？', options:['依角色限制可看的資料與可執行的動作，並保留紀錄','所有人都使用同一組最高權限','AI 的回答不需要被追蹤','為了方便，把敏感資料全部公開給模型'], answer:'依角色限制可看的資料與可執行的動作，並保留紀錄', explain:'最小權限、可追蹤與可稽核，是企業 AI 治理的重要基本功。'},
      {id:'system_agent', type:'quiz', required:true, label:'若 Agent 可以替使用者「真的去執行動作」，系統設計上最重要的新增考量是什麼？', options:['工具權限、確認機制、失敗處理與稽核紀錄','把字體放大','增加更多聊天表情','把每個任務都改成人工輸入'], answer:'工具權限、確認機制、失敗處理與稽核紀錄', explain:'Agent 能執行動作後，權限、安全確認、錯誤處理與稽核就比單純聊天更重要。'},
      {id:'course_concern', type:'single', required:false, label:'最後一個任務：你目前最擔心這堂課的哪一件事？', options:[
        {value:'程式能力跟不上', title:'程式能力跟不上', icon:'⌨️'},
        {value:'AI 名詞太多', title:'AI 名詞太多', icon:'🌀'},
        {value:'系統架構看不懂', title:'系統架構看不懂', icon:'🧩'},
        {value:'缺乏實作經驗', title:'缺乏實作經驗', icon:'🛠️'},
        {value:'不知道期末要做什麼題目', title:'不知道期末做什麼', icon:'❓'},
        {value:'擔心期末作品做不完', title:'怕作品做不完', icon:'⏳'},
        {value:'目前沒有特別擔心', title:'目前沒特別擔心', icon:'😌'}
      ], allowOther:true}
    ]
  },
  {
    id: 'boss', level: 5, title: 'Final Boss：AI 願望機', subtitle: '把想法變成你的第一個 AI 任務', icon: '👾', accent: 'pink',
    intro: '最後沒有標準答案。請把你真正想解決的問題投入願望機。',
    questions: [
      {id:'wish_tags', type:'multi-pills', required:false, label:'你的願望比較接近哪些主題？', options:['工作效率','資料分析','內容創作','自動化','學習','生活','自己提出']},
      {id:'want_to_build', type:'textarea', required:false, label:'如果今天給你 ChatGPT／Claude＋API＋資料，你最想做出什麼 AI 系統？', placeholder:'例如：讓 AI 幫我讀公司文件、整理資料，或完成一個重複的工作……', maxLength:180}
    ]
  }
];

window.ANSWER_KEY = {};
window.GAME_LEVELS.forEach(level => level.questions.forEach(q => { if (q.answer) window.ANSWER_KEY[q.id] = q.answer; }));
