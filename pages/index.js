export async function getServerSideProps(context) {
    context.res.writeHead(302, {
        'Location': 'https://parkingbase.app'
    }).end();

    return {
        props: {}
    };
}

export default function Home() {
    return (
        <p>Parkingbase Auth Server</p>
    )
}
