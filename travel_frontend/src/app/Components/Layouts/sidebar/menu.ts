import { MenuItem } from "./menu.model";

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'Menu',
        isTitle: true
    },
    {
        id: 2,
        label: 'Home',
        icon: 'ri-home-4-fill',
        link: '/home'
    },
    {
        id: 3,
        label: 'Stream',
        icon: 'ri-vidicon-fill',
        link: '/cam'
    },
    {
        id: 4,
        label: 'User',
        isTitle: true,
        link: '/'
    },
    {
        id: 5,
        label: 'My Album',
        icon: 'ri-gallery-line',
        link: '/album'
    },
    {
        id: 6,
        label: 'My Enhanced Album',
        icon: 'ri-image-edit-line',
        link: '/enhancedAlbum'
    },
    {
        id: 7,
        label: 'History',
        icon: 'ri-file-history-fill',
        link: '/'
    },
]