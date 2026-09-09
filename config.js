window.APP_CONFIG = {
  title: '歡迎來到AI University',
  courseLabel: '生成式 AI 系統設計與實務',
  apiUrl: 'https://script.google.com/macros/s/AKfycbxCFKtFJbwYavP5TMXgFcLsRWx7dVaV4BS44cLrNWwB_a1wfYmqZOExXqoeDNVz5Zzh/exec',
  formVersion: 'ai-university-game-2026-09-v1',
  autosaveKey: 'ai-university-game-draft-v2-academic',
  demoStorageKey: 'ai-university-game-responses-v2-academic',
  teacherRefreshSeconds: 10,
  maxXp: 1000,

  // 學期 → 課程 → 班級。新增班級時主要修改這裡即可。
  academicCatalog: [
    {
      id: '115-1',
      label: '115-1（2026 秋季）',
      courses: [
        {
          id: 'genai-system-design',
          label: '生成式 AI 系統設計與實務',
          classes: [
            { id: 'A', label: 'A班' },
            { id: 'B', label: 'B班' },
            { id: 'EMBA', label: 'EMBA班' }
          ]
        }
      ]
    }
  ],

  // 沒有帶網址參數時使用的預設班級。
  defaultAcademicContext: {
    termId: '115-1',
    courseId: 'genai-system-design',
    classId: 'A'
  }
};
