/**
 ** Instanciando um DATABASE no IndexedDB chamado posts-sotre e armazenando na dbPromise
 * 1º Parâmetro: Nome do DB
 * 2º Parâmetro: Versão do DB
 * 3º Parâmetro: Callback que é executado após a criação do DB
 */
let dbPromise = idb.open('posts-store', 1, (db) => {
  //? Todos os posts/anuncios do BD
  //* Checando se NÃO existe um objectStore com o nome que desejamos criar para não termos uma duplicidade
  if (!db.objectStoreNames.contains('posts')) {
    /**
     * *Instanciando um ObjectStore no DB posts-store, um Object-Store é similar a uma Tabela no BD convencional
     * 1º Parâmetro: Nome do Object Store
     * 2º Parâmetro: JSON definindo o nome da Primmary Key(chamada como keyPath) do Object Store
     */
    db.createObjectStore('posts', { keyPath: 'id' })
  }

  //? Todos os posts inseridos pelo usuário quando o app está sem conexão são armazenados temporariamente para serem sincronizados assim que a conexão voltar
  //* Checando se NÃO existe um objectStore com o nome que desejamos criar para não termos uma duplicidade
  if (!db.objectStoreNames.contains('sync-posts')) {
    /**
     * *Instanciando um ObjectStore no DB posts-store, um Object-Store é similar a uma Tabela no BD convencional
     * 1º Parâmetro: Nome do Object Store
     * 2º Parâmetro: JSON definindo o nome da Primmary Key(chamada como keyPath) do Object Store
     */
    db.createObjectStore('sync-posts', { keyPath: 'id' })
  }
});

/**
 * Função para escrever uma informação no ObjectStore(Tabela) 
 * @param {string} objectStoreName    Nome do ObjectStore
 * @param {JSON} dataToStore          Informação a ser gravada no ObjectStore
 */
function writeData(objectStoreName, dataToStore){
  //Abrindo a Promise que da acesso ao DB 'posts-store' do IndexedDB 
  return dbPromise
  .then( db => {
    /**
     * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'posts-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
     * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'posts-store' no IndexedDB que a transaction vai operar
     * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
    */
    let transaction = db.transaction(objectStoreName, 'readwrite');

    //Abrindo o Object Store(Tableas) após a transaction ser configurada acima
    let store = transaction.objectStore(objectStoreName);

    //Guardando cada POST/ANUNCIO no respectivo ObjectStore(Tableas)
    store.put(dataToStore);

    //Fechando a transaction [!OBS: Necessário apenas em transactions com permissão readwrite]
    return transaction.complete;
  });
}

/**
 * Função para ler todas informações no respectivo ObjectStore(Tabela) 
 * @param {string} objectStoreName    Nome do ObjectStore
 */
function readAllData(objectStoreName) {
  //Abrindo a Promise que da acesso ao DB 'posts-store' do IndexedDB 
  return dbPromise
    .then( db => {
      /**
       * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'posts-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
       * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'posts-store' no IndexedDB que a transaction vai operar
       * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
      */
      let transaction = db.transaction(objectStoreName, 'readonly');

      //Abrindo o Object Store(Tableas) após a transaction ser configurada acima
      let store = transaction.objectStore(objectStoreName);

      //Pegando todas informações no respectivo ObjectStore(Tableas)
      return store.getAll();
    });
}

/**
 * Função para apagar todas informações no respectivo ObjectStore(Tabela) 
 * @param {string} objectStoreName    Nome do ObjectStore
 */
function clearAllData(objectStoreName){
  //Abrindo a Promise que da acesso ao DB 'posts-store' do IndexedDB 
  return dbPromise
    .then( db => {
      /**
       * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'posts-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
       * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'posts-store' no IndexedDB que a transaction vai operar
       * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
      */
      let transaction = db.transaction(objectStoreName, 'readwrite');

      //Abrindo o Object Store(Tableas) após a transaction ser configurada acima
      let store = transaction.objectStore(objectStoreName);

      //Limpando todas informações no respectivo ObjectStore(Tabelas)
      store.clear();

      //Fechando a transaction [!OBS: Necessário apenas em transactions com permissão readwrite]
      return transaction.complete;
    })
}

/**
 * Função para apagar uma informação respectiva ao id passado no respectivo ObjectStore(Tabela) 
 * @param {string} objectStoreName    Nome do ObjectStore
 * @param {int} id                    Id(PrimmaryKey) do objeto no ObjectStore
 */
function deleteItemFromData(objectStoreName, id) {
  //Abrindo a Promise que da acesso ao DB 'posts-store' do IndexedDB
  dbPromise
    .then( db => {
      /**
       * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'posts-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
       * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'posts-store' no IndexedDB que a transaction vai operar
       * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
      */
      let transaction = db.transaction(objectStoreName, 'readwrite');

      //Abrindo o Object Store(Tableas) após a transaction ser configurada acima
      let store = transaction.objectStore(objectStoreName);

      //Deletando a informação do respectivo ID(PrimmaryKey) no respectivo ObjectStore(Tabelas)
      store.delete(id);

      //Fechando a transaction [!OBS: Necessário apenas em transactions com permissão readwrite]
      return transaction.complete;
    })
    .then( () => {
      console.log('Item deleted from IndexedId!');
    })
}