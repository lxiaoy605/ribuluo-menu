import { ref, computed } from 'vue'
import { useMenuData } from './useMenuData'

const langs = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'am', label: 'Հայերեն', flag: '🇦🇲' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' }
]

const uiTexts = {
  zh: {
    search: '搜索菜品',
    share: '分享菜单',
    export: '一键成图',
    edit: '管理菜单',
    back: '返回菜单',
    login: '管理员登录',
    password: '管理员密码',
    setPassword: '设置密码',
    confirmPassword: '确认密码',
    enter: '进入后台',
    shopName: '店铺名称',
    categories: '分类管理',
    products: '菜品管理',
    addCategory: '新增分类',
    addProduct: '新增菜品',
    editCategory: '编辑分类',
    editProduct: '编辑菜品',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    name: '名称',
    price: '价格',
    image: '图片',
    imagePosition: '图片位置',
    category: '所属分类',
    recommended: '招牌推荐',
    soldOut: '已售罄',
    exportData: '导出数据',
    importData: '导入数据',
    exportImage: '导出图片',
    resolution: '分辨率',
    download: '下载',
    copyLink: '复制链接',
    scanQR: '扫一扫查看菜单',
    contact: '联系我们',
    noImage: '无图片',
    dataBackup: '数据备份',
    importSuccess: '导入成功',
    importError: '导入失败，请检查文件格式',
    deleteConfirm: '确认删除？',
    pricePlaceholder: '例如：500',
    dataSaved: '数据已保存',
    passwordError: '密码错误',
    passwordSetSuccess: '密码设置成功',
    firstTimeSetup: '首次使用，请设置管理密码',
    menuEmpty: '菜单正在准备中，请稍后再来 🍖',
    noProducts: '该分类暂无菜品',
    noMatch: '没有找到匹配的菜品'
  },
  am: {
    search: 'Որոնել',
    share: 'Կիսվել',
    export: 'Նկարել',
    edit: 'Կառավարել',
    back: 'Վերադառնալ',
    login: 'Մուտք',
    password: 'Գաղտնաբառ',
    setPassword: 'Ստեղծել գաղտնաբառ',
    confirmPassword: 'Հաստատել գաղտնաբառը',
    enter: 'Մուտք գործել',
    shopName: 'Ռեստորանի անուն',
    categories: 'Կատեգորիաներ',
    products: 'Ուտեստներ',
    addCategory: 'Ավելացնել կատեգորիա',
    addProduct: 'Ավելացնել ուտեստ',
    editCategory: 'Խմբագրել կատեգորիան',
    editProduct: 'Խմբագրել ուտեստը',
    delete: 'Ջնջել',
    save: 'Պահպանել',
    cancel: 'Չեղարկել',
    name: 'Անուն',
    price: 'Գին',
    image: 'Նկար',
    imagePosition: 'Նկարի դիրք',
    category: 'Կատեգորիա',
    recommended: 'Խորհուրդ',
    soldOut: 'Վաճառված',
    exportData: 'Արտահանել',
    importData: 'Ներմուծել',
    exportImage: 'Նկարել',
    resolution: 'Թույլտվություն',
    download: 'Ներբեռնել',
    copyLink: 'Պատճենել',
    scanQR: 'Սկանավորեք',
    contact: 'Կապ',
    noImage: 'Առանց նկար',
    dataBackup: 'Պահուստավորում',
    importSuccess: 'Ներմուծումը հաջողվեց',
    importError: 'Ներմուծման սխալ',
    deleteConfirm: 'Հաստատե՞լ ջնջումը',
    pricePlaceholder: 'Օր. 500',
    dataSaved: 'Տվյալները պահպանված են',
    passwordError: 'Սխալ գաղտնաբառ',
    passwordSetSuccess: 'Գաղտնաբառը ստեղծված է',
    firstTimeSetup: 'Առաջին անգամ, ստեղծեք գաղտնաբառ',
    menuEmpty: 'Ճաշացանկը պատրաստվում է 🍖',
    noProducts: 'Այս կատեգորիայում ուտեստներ չկան',
    noMatch: 'Ոչինչ չի գտնվել'
  },
  en: {
    search: 'Search',
    share: 'Share',
    export: 'Export Image',
    edit: 'Manage',
    back: 'Back to Menu',
    login: 'Admin Login',
    password: 'Password',
    setPassword: 'Set Password',
    confirmPassword: 'Confirm Password',
    enter: 'Enter',
    shopName: 'Shop Name',
    categories: 'Categories',
    products: 'Dishes',
    addCategory: 'Add Category',
    addProduct: 'Add Dish',
    editCategory: 'Edit Category',
    editProduct: 'Edit Dish',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    name: 'Name',
    price: 'Price',
    image: 'Image',
    imagePosition: 'Image Position',
    category: 'Category',
    recommended: 'Recommended',
    soldOut: 'Sold Out',
    exportData: 'Export Data',
    importData: 'Import Data',
    exportImage: 'Export Image',
    resolution: 'Resolution',
    download: 'Download',
    copyLink: 'Copy Link',
    scanQR: 'Scan to View Menu',
    contact: 'Contact Us',
    noImage: 'No Image',
    dataBackup: 'Data Backup',
    importSuccess: 'Import successful',
    importError: 'Import failed, check file format',
    deleteConfirm: 'Confirm delete?',
    pricePlaceholder: 'e.g. 500',
    dataSaved: 'Data saved',
    passwordError: 'Wrong password',
    passwordSetSuccess: 'Password set successfully',
    firstTimeSetup: 'First time setup, please set a password',
    menuEmpty: 'Menu is being prepared, check back soon 🍖',
    noProducts: 'No dishes in this category',
    noMatch: 'No matching dishes found'
  },
  ru: {
    search: 'Поиск',
    share: 'Поделиться',
    export: 'Экспорт',
    edit: 'Управление',
    back: 'Назад в меню',
    login: 'Вход',
    password: 'Пароль',
    setPassword: 'Установить пароль',
    confirmPassword: 'Подтвердите пароль',
    enter: 'Войти',
    shopName: 'Название',
    categories: 'Категории',
    products: 'Блюда',
    addCategory: 'Добавить категорию',
    addProduct: 'Добавить блюдо',
    editCategory: 'Изменить категорию',
    editProduct: 'Изменить блюдо',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    name: 'Название',
    price: 'Цена',
    image: 'Фото',
    imagePosition: 'Позиция фото',
    category: 'Категория',
    recommended: 'Рекомендуемое',
    soldOut: 'Продано',
    exportData: 'Экспорт',
    importData: 'Импорт',
    exportImage: 'Экспорт',
    resolution: 'Разрешение',
    download: 'Скачать',
    copyLink: 'Копировать',
    scanQR: 'Сканируйте',
    contact: 'Контакты',
    noImage: 'Без фото',
    dataBackup: 'Резервная копия',
    importSuccess: 'Импорт успешен',
    importError: 'Ошибка импорта',
    deleteConfirm: 'Подтвердить удаление?',
    pricePlaceholder: 'напр. 500',
    dataSaved: 'Данные сохранены',
    passwordError: 'Неверный пароль',
    passwordSetSuccess: 'Пароль установлен',
    firstTimeSetup: 'Первый вход, установите пароль',
    menuEmpty: 'Меню готовится, заходите позже 🍖',
    noProducts: 'В этой категории нет блюд',
    noMatch: 'Ничего не найдено'
  }
}

const currentLang = ref('zh')

export function useI18n() {
  const { getMenuData } = useMenuData()

  function t(key) {
    return uiTexts[currentLang.value]?.[key] || uiTexts['zh'][key] || key
  }

  function tName(nameObj) {
    if (!nameObj) return ''
    if (typeof nameObj === 'string') return nameObj
    return nameObj[currentLang.value] || nameObj['zh'] || ''
  }

  function setLang(code) {
    currentLang.value = code
    const data = getMenuData()
    if (data) {
      data.currentLang = code
    }
  }

  function initLang() {
    const data = getMenuData()
    if (data?.currentLang) {
      currentLang.value = data.currentLang
    }
  }

  const langOptions = langs

  return { t, tName, currentLang, setLang, initLang, langOptions }
}

export function getUiText(lang, key) {
  return uiTexts[lang]?.[key] || uiTexts['zh'][key] || key
}
