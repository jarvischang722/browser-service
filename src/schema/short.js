const getLong = (str) => {
  let result = { long: '' }
  switch (str) {
    case 't1t':
    case 'tot':
      result = {
        long: 'www.tripleonetech.net',
        site_name: '合众科技',
        logo_url: '',
      }
      break
    case 'apple':
      result = {
        long: 'www.apple.com',
        site_name: '苹果',
        logo_url: '',
      }
      break
    case 'lanhai':
      result = {
        long: 'www.lanhai.t1t.games',
        site_name: '',
        logo_url: '',
      }
      break
    case 'xc':
      result = {
        long: 'm.xc33.com',
        site_name: '新橙',
        logo_url: 'http://52.198.79.141/download/icon/xc.png',
      }
      break
    case 'youhu':
      result = {
        long: 'm.youhu.t1t.games',
        site_name: '游虎娱乐',
        logo_url: 'http://52.198.79.141/download/icon/youhu.png',
      }
      break
    case 'macaopj':
      result = {
        long: 'm.p9601.com',
        site_name: '澳门葡京',
        logo_url: 'http://52.198.79.141/download/icon/macaopj.png',
      }
      break
    case 'xpj':
      result = {
        long: 'm.xpj.t1t.games',
        site_name: '新葡京',
        logo_url: 'http://52.198.79.141/download/icon/xpj.png',
      }
      break
    case 'lebo':
      result = {
        long: 'm.lbbet888.com',
        site_name: '乐博',
        logo_url: 'http://52.198.79.141/download/icon/lebo.png',
      }
      break
    case 'lequ':
      result = {
        long: 'm.lequ.t1t.games',
        site_name: '乐趣时时彩',
        logo_url: 'http://52.198.79.141/download/icon/lequ.png',
      }
      break
    case 'dlcity':
      result = {
        long: 'm.dlcity.t1t.games',
        site_name: '电乐城',
        logo_url: 'http://52.198.79.141/download/icon/dlcity.png',
      }
      break
    default:
      break
  }
  return result
}

module.exports = {
  getLong,
}
