export const ConstList = {
  //M2M認証に使用する
  API_CLIENT_ID: 'CYIoJtYhK6n5sYhpGAuaOAOEdX5DSBpW', 
  AUDIENCE: 'https://m-and-t.jp.auth0.com/api/v2/',

  SYS_TOPDOMAIN: '/intra',  //システムトップドメイン

  SYS_TITLE: '昭和産業イントラサイト',  //タイトル


  //シークレットトークンを使用したアクセストークン取得用URL
  TOKEN_URL: `https://m-and-t.jp.auth0.com/oauth/token`,
  PG_API_DOMAIN: 'https://keiri-system.local',
  PG_API_URL: 'https://keiri-system.local/api/pg_api.php',
  LOCAL_PG_API_URL: 'http://localhost/kosuApi/pg_api.php',

  API: 'https://system.syowa.com/api/',
  AUTHENTICATION_API: 'https://system.syowa.com/AuthenticationApi/',
  SERVER_API: 'https://keiri-system.local/api/',
  LOCAL_API: 'http://localhost/',
  LOCAL_AUTHENTICATION_API: 'http://localhost/AuthenticationApi/',

  FILE_PATH: 'https://system.syowa.com/files/',
  LOCAL_FILE_PATH: 'http://localhost/files/',

  NUM_Neg1: -1,

  //エラー
  // ERROR_MESSAGES : {
  //   unexpected_error: '予期せぬエラーが発生しました。',
  //   title_required: 'タイトルは必須です。',
  // },


  // 権限
  DEVELORER_AUTHORITY: 1, //開発者
  ADMIN_AUTHORITY: 2, //管理者
  KENGEN_AUTHORITY: 3, //権限者
  NORMAL_AUTHORITY: 4, //一般

  // 雇用形態
  HAKEN_EMPLOYMENT: 6,//派遣
  KYORYOKU_EMPLOYMENT: 7,//協力会社
  SIYOKIKAN_EMPLOYMENT: 8,//試用期間

  // 部署
  BUSYO_SEKKEI: 1,
  BUSYO_SEKKEI_MEKA: 29,
  BUSYO_SEKKEI_HOKA: 30,
  BUSYO_SEIZO: 2,
  BUSYO_5_2k: 14,
  BUSYO_SUMITOMO: 15,
  BUSYO_BIB: 9, // 半導体テストBUの部署ID


  // DataGridに使用しているスタイル
  DATA_GRID_STYLES: {
    // 通常用
    grid: {
      // 列ヘッダに背景色を指定
      '.MuiDataGrid-columnHeaders': {
        backgroundColor: '#4791db',
        color: '#fff',
      },
      '.MuiDataGrid-row:not(.MuiDataGrid-row--dynamicHeight)>.MuiDataGrid-cell':
        {
          whiteSpace: 'nomal',
          wordWrap: 'break-word',
        },
      '.MuiDataGrid-pinnedColumnHeaders': {
        backgroundColor: '#4791db', // ヘッダーの背景色を設定
      },
    },
    // スマホ用
    mobileGrid: {
      // 列ヘッダに背景色を指定
      '.MuiDataGrid-columnHeaders': {
        backgroundColor: '#4791db',
        color: '#fff',
      },
      '.MuiDataGrid-row:not(.MuiDataGrid-row--dynamicHeight)>.MuiDataGrid-cell':
        {
          whiteSpace: 'nomal',
          wordWrap: 'break-word',
        },
      '.MuiDataGrid-pinnedColumnHeaders': {
        backgroundColor: '#4791db', // ヘッダーの背景色を設定
      },
      fontSize: '0.75rem',
    },
  },

  // 応援データの背景色
  SUPPORT_BG_COLOR: '#e6cfa1',

  ALGORITHM: 'RS256',

}


