import Post from './models/post';

export default function createFakeData() {
    // 0 ~ 원하는 포스트 수 만큼의 배열을 생성한 후 포스트 데이터로 변환
    const posts = [...Array(40).keys()].map((i) => ({
        title: `포스트 #${i}`,
        // lipsum
        body: 'Lorem Ipsum es en hecho establecido hace demasiado tiempo que un lector se distraerá con el contenido del texto de un sitio mientras que mira su diseño. El punto de usar Lorem Ipsum es que tiene una distribución más o menos normal de las letras, al contrario de usar textos como por ejemplo "Contenido aquí, contenido aquí". Estos textos hacen parecerlo un español que se quede leer. Muchos paquetes de autoedición y editores de páginas web usan el Lorem Ipsum como su texto por defecto, y al hecer una búsqueda de "Lorem Ipsum" va a dar por resultado muchos sitios web que usan este texto si se encuentran en estado de desarrollo. Muchas versiones han evolucionado a través de los años, algunas veces por accidente, otras veces a propósito(por ejemplo insertándole humor y cosas por el estilo).',
        tags: ['가짜', '데이터'],
    }));
    Post.insertMany(posts, (err, docs) => {
        console.log(docs);
    });
}
