export class GlobalFunctions {
  async getObjectFilterGrid(keyOrder, order, page, cant, filter) {
      if (filter == null || filter == "") {
          filter = "[]"
      }
      const filterArray = JSON.parse(filter)
      var arrayContains = []
      for (let index = 0; index < filterArray.length; index++) {
          var keys = filterArray[index].keyContains.split('.')
          var objectToAdd = {}
          if (keys.length > 1) {
              objectToAdd = {
                  [keys[0]]: {
                      [keys[1]]: {
                          [filterArray[index].key]: filterArray[index].value
                      }
                  }
              }
          } else {
              objectToAdd = {
                  [filterArray[index].keyContains]: {
                      [filterArray[index].key]: filterArray[index].key == 'in' ? JSON.parse(filterArray[index].value) : filterArray[index].value
                  }
              }
          }
          arrayContains.push(objectToAdd)
      }

      var element = {
          order: {
              [keyOrder]: order
          },
          contains: arrayContains,
          page: page,
          cant: Number(cant)
      }
      return element;
  }
  async getOffsetByPage(page, cant) {
      page = Number(page)
      cant = Number(cant)
      return (page - 1) * cant;
  }
  async getCantPages(total_rows, limit) {

      limit = Number(limit)

      let pages = 0;
      let q = total_rows / limit;
      let q_int = Math.floor(q);
      let r = total_rows % limit;

      if (q === 0) return 0;

      if (q <= 1) return 1;

      if (r === 0) return q;

      if (r > 0) return q_int + 1;

      return (total_rows / limit);
  }
  async getResponseFilter(limit, order, page, sort, total_pages, total_rows) {
      return ({
          limit,
          order,
          page,
          sort,
          total_pages,
          total_rows,
      })
  }
  async groupByProperty(array, property){
      return array.reduce((acc, obj) => {
          const key = obj[property];
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(obj);
          return acc;
        }, {});
  }
  
  generateRandomPassword(length: number): string {
      /* const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; */
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      /* const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?'; */
      const allChars = lowercase + numbers;

      let password = '';

      /* // Ensure the password includes at least one character from each category
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += specialChars[Math.floor(Math.random() * specialChars.length)];

      // Fill the rest of the password length with random characters
      for (let i = password.length; i < 8; i++) {
          password += allChars[Math.floor(Math.random() * allChars.length)];
      }

      // Shuffle the password to ensure the order is random
      password = password.split('').sort(() => 0.5 - Math.random()).join(''); */

      // Generar 4 letras minúsculas aleatorias
      for (let i = 0; i < 4; i++) {
          password += lowercase[Math.floor(Math.random() * lowercase.length)];
      }

      // Generar 4 números aleatorios
      for (let i = 0; i < 4; i++) {
          password += numbers[Math.floor(Math.random() * numbers.length)];
      }

      return password;
  }
}