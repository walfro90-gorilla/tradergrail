'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export default function LocaleSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const onLocaleChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Switch language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-gray-100">
                <DropdownMenuItem
                    onClick={() => onLocaleChange('en')}
                    className={locale === 'en' ? 'bg-gray-800' : ''}
                >
                    English
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onLocaleChange('es-mx')}
                    className={locale === 'es-mx' ? 'bg-gray-800' : ''}
                >
                    Español (MX)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
