/*
Funcion asincrona  para traer los datos de pokemon por su nombre.
*/
const getPokemonsData = async (name) => {
  let data = {};
  try {
    /* 
    uso fetch para traer los datos del pokemon desde la poke api, fectch me regresa una promesa dentro de 
    una promesa y extraigo los valores haciendo uso de await, await y async se usan juntos para poder 
    resolver promesas y al final formateo la respuesta del servidor a formato json
    y retorno los datos al finalizar la funcion.

    uso un bloque try catch para saber si algo fallo y no afectar la ejecucion de mi programa. 

     */
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}/`);
    data = await response.json();
  } catch(error) {
    console.log("error on fetch",error);
  }
  return data;
};

const fetchPokemons = async () => {
  /* fetchPokemons es una funcion asyncrona que nos ayuda a traer la lista completa de los pokemones
  y ademas que manda a llamar los datos de cada pokemon haciendo uso de la funcion getPokemonData, 
  primero se hace un fetch donde se trae la lista completa de los pokemones, una vez que se tiene la 
  lista completa de los pokemones, mando a llamar los datos de cada pokemon. 
  
  para poder hacer el llamado de todos los pokemones utilizo Promise.all (promise.all me permite ejecutar
    un array de promesas y retornar el resultado de todas esas promesas en forma de arreglo, dentro de una promesa) 
    lo que me ayuda a guardar los datos de todos los pokemones en un arreglo mediante
     la ejecucion demultiples promesas, cada una generada por la llamada a los datos de cada pokemon, 
     utilice .then junto a la llamada de getPokemonData para poder juntar los datos que ya tenia de cada
      pokemon con los datos nuevos, como sus formas, movimientos, ataques,
  estadisticas, tipos, etc. 
  */
  const response = await fetch("https://pokeapi.co/api/v2/pokedex/1/");
  const pokemonList = await response.json();
  const data = await Promise.all(
    pokemonList.pokemon_entries.map(async (data) => {
      let newData = getPokemonsData(data.pokemon_species.name).then(
        (pokemon) => {
          return {
            ...data.pokemon_species,
            extra_data: pokemon,
          };
        }
      );
      return await newData;
    })
  );
  return data;
};

const htmlForModal = `
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="staticBackdropLabel">
          {{pokemonName}}
        </h1>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="card">
          <img
            src="{{pokemonImage}}"
            class="card-img-top"
            alt="{{pokemonName}}"
          />
          <div class="card-body">
            <h5 class="card-title">{{pokemonName}}</h5>
            <ul class="list-group list-group-flush" id="pokemon-stats">
              
            </ul>
          </div>
        </div>
      </div>
    </div>
`;

const htmlForSpinner = `
  <div class="d-flex justify-content-center aling-items-center mt-5">
    <div class="spinner-border text-warning" style="width: 5rem; height: 5rem;"  role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
`;

const htmlForCard = `
  <div class="col-md-3 mb-2">
    <div class="card">
      <img src="{{pokemonImage}}" class="card-img-top" alt="{{pokemonName}}">
      <div class="card-body">
        <h5 class="card-title">{{pokemonName}}</h5>
        <button 
          data-bs-toggle="modal"
          data-bs-target="#modal-pokemon-detail" 
          onclick="pokemons.renderPokemonDetail.call(this,'{{pokemonName}}')" 
          class="btn btn-primary"
         >
          Ver mas
         </button>
      </div>
    </div>
  </div>
 `;


 /*
 Esta funcion sirve para saber si un pokemon tiene su imagen y si no la tiene ponerle un place holder 
 para que no se vea vacia la tarjeta, utilice uno de placerholder.com.

 utilice el operador optional chaining para validar si tenia su imagen, que valida si una llave existe
 o no, si no, retorna falso, cuando la llave no existe con el operador || or retorna el place holder. */
 
const getPokemonIMG = (pokemon) =>
  pokemon?.extra_data?.sprites?.front_default || "https://placehold.co/304x304";


  /* Esta funcion nos retorna el codigo html de la tarjeta de cada pokemon con la url de la imagen del 
  pokemon y el nombre ya insertados, recibe un arrelgo de datos con la URL y el nombre del pokemon, 
  y mediante un cliclo for each remplaza estos valores en el html de la tarjeta. */
const formatCardWithPokemonData = (pokemonData) => {
  const replaceKeys = ["{{pokemonImage}}", "{{pokemonName}}"];
  let card = htmlForCard;
  replaceKeys.forEach((key, i) => {
    card = card.replaceAll(key, pokemonData[i]);
  });
  return card;
};

/* Esta funcion nos retorna el html de todos los pokemones con sus datos insertados, hace uso de las funciones 
de Getpokemonimg para obtener su imagen y la funcion formatcardwithpokemondata para obtener la tarjeta de cada 
pokemon con sus datos insertados.

con el metodo join regresa un string de todos los elementos del array con un salto de linea (\n) como separador 
de cada elemento del arreglo, todo esto lo hace iterando la lista de pokemones que traemos de la poke api*/
const printPokemonList = (pokemonList) => {

  const formatedList = pokemonList.map(({ name, ...pokemon }) => {
    const pokemonIMG = getPokemonIMG(pokemon);
    return formatCardWithPokemonData([pokemonIMG, name]);
  });

  return formatedList.join("\n");
};


/* formatModal es una funcion que nos ayuda a insertar los datos del pokemon seleccionado dentro de la modal
de detalle del pokemon, recibe un arreglo d eun pokemon y reutiliza un poco de codigo de la funcion 
formatcardwithpokemondata para insertar los datos en la modal y al final inserta el html modificado dentro 
de la modal. 

const { name } = currentPokemon; destructuracion de variable.
*/
const formatModal = (pokemon) => {
  if (pokemon.length > 0) {
    const modalElement = document.getElementById("modal-content");
    const currentPokemon = pokemon[0];
    const { name } = currentPokemon;
    const pokemonIMG = getPokemonIMG(currentPokemon);
    let modal = htmlForModal;
    const replaceKeys = ["{{pokemonImage}}", "{{pokemonName}}"];
    const dataKeys = [pokemonIMG, name];
    replaceKeys.forEach((key, i) => {
      modal = modal.replaceAll(key, dataKeys[i]);
    });
    modalElement.innerHTML = modal;
  }
};

/* La clase pokemon representa a la entidad de los pokemones, esta clase nos ayuda a manejar los datos de los pokemons
y su representacion en el html, en su constructor definimos la propiedad pokemons que es donde se almacena la lista de pokemones,
tambien en el constructor mandamos a llamar los datos de los pokemones para que estos se cargen en el html, adicionalmente se hace
un bind del this de la clase a los metodos de la clase que son llamados desde el html.

*/
class Pokemons {
  constructor() {
    this.pokemons = [];
    this.fetchPokemonsList();
    this.renderPokemonDetail = this.renderPokemonDetail.bind(this);
    this.renderPokemonSearch = this.renderPokemonSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }
  /* En este metodo insertamos un spinner de boostrap que nos ayuda a mostrarle al usuario que se estan cargando los datos. */
  renderLoading() {
      const container = document.getElementById("list");
      container.innerHTML = htmlForSpinner;
  }
  /* Este metodo va a buscar dentro de la lista de pokemones el pokemon deseado por su nombre, este siempre va a regresar un arreglo,
  en caso de no encontrar un pokemon el arreglo vendra vacio. */
  getSearchPokemon(pokemonName) {
    const result = this.pokemons.filter(({ name }) => name === pokemonName);
    return result;
  }

  /* Este metodo llama la funcion printpokemonlist la cual le devuelve el html conla lista de todos lo pokemones, e inserta 
  ese html en el div con el id list. */
  renderPokemonsList() {
    const container = document.getElementById("list");
    container.innerHTML = printPokemonList(this.pokemons);
  }

  /* este metodo llama al metodo getSerachPokemon el cual le regresa un arreglo con la informacion del pokemon deseado, una vez
  que se tienen los datos del pokemon se los pasa a la funcion formatModal la cual muestra la modal del detalle del pokemon. */
  renderPokemonDetail(pokemonName) {
    const pokemon = this.getSearchPokemon(pokemonName);
    formatModal(pokemon);
  }
    /* Este metodo se ejecuta cuando el usuario hace click en el boton buscar, cuando se ejecuta el metodo toma el valor escrito
    en el input con el id pokemonSearch con esto llama al metodo getsearchpokemon y obtiene los detalles del pokemon, si el pokemon
    existe mostrara su informacion si no existe mostrara mensaje de inexistencia. */
  renderPokemonSearch() {
    const input = document.getElementById("pokemon-search");
    const container = document.getElementById("list");
    let pokemonList = this.pokemons;
    if (input.value.length > 0) {
      const cleanSearchButton = document.getElementById("btn-clean-search");
      cleanSearchButton.classList.remove("d-none");
      cleanSearchButton.classList.add("d-flex");
      const pokemon = this.getSearchPokemon(input.value);
      pokemonList = pokemon;
    }
    if(pokemonList.length === 0){
      container.innerHTML="<span> No existe el pokemon </span>"
    } else {container.innerHTML = printPokemonList(pokemonList);}
  }

    /* Este metodo se ejecuta cuando el usuario hace clic en el boton con la X esto limpiara el input de busqueda ocultara el boton con 
    la X y volvera a mostrar la lista inicial de pokemons. */
  clearSearch() {
    const cleanSearchButton = document.getElementById("btn-clean-search");
    cleanSearchButton.classList.remove("d-flex");
    cleanSearchButton.classList.add("d-none");
    const input = document.getElementById("pokemon-search");
    input.value = "";
    this.renderPokemonsList();
  }
    /* Es un metodo asyncrono que nos permite obtener la lista de todos los pokemones y guardarla en la propiedad pokemons de esta clase,
    una vez que tiene la lista del pokemon ejecuta el metodo renderpokemonlist. */
  async fetchPokemonsList() {
    try {
      this.renderLoading();
      const data = await fetchPokemons();
      this.pokemons = data;
      this.renderPokemonsList();
    } catch (e) {
      console.log("error on fetch pokemons", e);
    }
  }
}

const pokemons = new Pokemons();
