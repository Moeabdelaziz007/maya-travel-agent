// Telegram WebApp SDK Integration
// Note: @twa-dev/sdk will be installed when running npm install

// Initialize Telegram WebApp
export const initTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Configure WebApp
    tg.ready();
    tg.expand();
    
    // Enable closing confirmation
    tg.enableClosingConfirmation();
    
    // Set header color to match theme
    tg.setHeaderColor('#0ea5e9');
    
    // Set background color
    tg.setBackgroundColor('#f8fafc');
    
    return tg;
  }
  
  return null;
};

// Get Telegram user data
export const getTelegramUser = () => {
  const tg = initTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
};

// Get Telegram theme
export const getTelegramTheme = () => {
  const tg = initTelegramWebApp();
  return tg?.colorScheme || 'light';
};

// Show Telegram alert
export const showTelegramAlert = (message: string) => {
  const tg = initTelegramWebApp();
  if (tg) {
    tg.showAlert(message);
  } else {
    alert(message);
  }
};

// Show Telegram confirm
export const showTelegramConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
  const tg = initTelegramWebApp();
  if (tg) {
    tg.showConfirm(message, callback);
  } else {
    const confirmed = confirm(message);
    if (callback) callback(confirmed);
  }
};

// Show Telegram popup
export const showTelegramPopup = (params: {
  title?: string;
  message: string;
  buttons?: Array<{
    id?: string;
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
    text?: string;
  }>;
}) => {
  const tg = initTelegramWebApp();
  if (tg) {
    tg.showPopup(params);
  } else {
    alert(params.message);
  }
};

// Close WebApp
export const closeTelegramWebApp = () => {
  const tg = initTelegramWebApp();
  if (tg) {
    tg.close();
  }
};

// Send data to bot
export const sendDataToBot = (data: any) => {
  const tg = initTelegramWebApp();
  if (tg) {
    tg.sendData(JSON.stringify(data));
  }
};

// Get init data
export const getInitData = () => {
  const tg = initTelegramWebApp();
  return tg?.initData || '';
};

// Get init data unsafe
export const getInitDataUnsafe = () => {
  const tg = initTelegramWebApp();
  return tg?.initDataUnsafe || {};
};

// Check if running in Telegram
export const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && 
         window.Telegram?.WebApp && 
         window.Telegram.WebApp.initData !== '';
};

// Get main button
export const getMainButton = () => {
  const tg = initTelegramWebApp();
  return tg?.MainButton;
};

// Get back button
export const getBackButton = () => {
  const tg = initTelegramWebApp();
  return tg?.BackButton;
};

// Get haptic feedback
export const getHapticFeedback = () => {
  const tg = initTelegramWebApp();
  return tg?.HapticFeedback;
};

// Trigger haptic feedback
export const triggerHapticFeedback = (type: 'impact' | 'notification' | 'selection' = 'impact', style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
  const haptic = getHapticFeedback();
  if (haptic) {
    if (type === 'impact') {
      haptic.impactOccurred(style || 'medium');
    } else if (type === 'notification') {
      haptic.notificationOccurred('success');
    } else if (type === 'selection') {
      haptic.selectionChanged();
    }
  }
};

// Set main button
export const setMainButton = (text: string, onClick: () => void, color?: string) => {
  const mainButton = getMainButton();
  if (mainButton) {
    mainButton.setText(text);
    mainButton.onClick(onClick);
    if (color) {
      mainButton.setParams({ color });
    }
    mainButton.show();
  }
};

// Hide main button
export const hideMainButton = () => {
  const mainButton = getMainButton();
  if (mainButton) {
    mainButton.hide();
  }
};

// Set back button
export const setBackButton = (onClick: () => void) => {
  const backButton = getBackButton();
  if (backButton) {
    backButton.onClick(onClick);
    backButton.show();
  }
};

// Hide back button
export const hideBackButton = () => {
  const backButton = getBackButton();
  if (backButton) {
    backButton.hide();
  }
};

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showPopup: (params: any) => void;
        sendData: (data: string) => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          chat?: {
            id: number;
            type: string;
            title?: string;
            username?: string;
            photo_url?: string;
          };
          auth_date: number;
          hash: string;
        };
        colorScheme: 'light' | 'dark';
        themeParams: {
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
          hint_color?: string;
          bg_color?: string;
          text_color?: string;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: any) => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}
