import request from '@/axios'

/**
 * 字典数据操作对象
 * @param {string} type 字典类型
 */
const DictObj = function (type) {
  this.type = type
  this.items = {}
  this.count = 0

  this.get = value => {
    let d = this.items[value]
    return d ? d.dictLabel : ''
  }
}

export function useDicts(types) {
  // return dictObj(type)
  return new Promise((resolve, reject) => {
    loadDictData(types)
      .then(res => {
        //处理字典数据
        let dictObjs = {}

        for (let d of res.data) {
          let di = dictObjs[d.dictType]
          if (!di) {
            di = new DictObj(d.dictType)
            dictObjs[d.dictType] = di
          }
          di.items[d.dictValue] = d
          di.count++
        }
        resolve(dictObjs)
      })
      .catch(res => {
        reject(res)
      })
  })
}

function loadDictData(types) {
  if (typeof types == 'string') {
    return request.get({ url: `/system/dict/data/type/${types}` })
  } else if (types.length == 1) {
    // return dictDataApi.get('/type/' + types[0])
    return request.get({ url: `/system/dict/data/type/${types[0]}` })
  } else {
    // return dictDataApi.get('/list', { paging: false, dictType: types })
    return request.get({ url: `/system/dict/data/list`, params: { paging: false, dictType: types } })
  }
}
