import { usePage } from '@inertiajs/react';
import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const {company} = usePage().props as any;
     const src = company?.logo !== null ? `/storage/${company.logo}` : '/storage/logos/logo.jpg';
    return (
       
        // default logo
       <img src={src} alt={company?.name ? `${company.name} logo` : 'App Logo'} />
        
        // <img src={'/storage/' + company?.logo || '/storage/logos/logo.jpg'} alt="App Logo"  />

    );
}
