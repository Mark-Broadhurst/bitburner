/** 
 * Sory by property
 * @param {string} property
 */
export default function sortBy(property){

  /** 
   * @param {server} a
   * @param {server} b
   */
    return function  (a, b){
      if(a[property] > b[property]) {
        return 1;
      }
      if(a[property] < b[property]) {
        return -1;
      }
      return 0;
    }
  }