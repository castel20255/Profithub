import React from 'react';
import Text from '@/components/shared_ui/text';
import { Localize } from '@deriv-com/translations';
import './tab-placeholder.scss';

type TabPlaceholderProps = {
    title: string;
    description?: string;
};

const TabPlaceholder = ({ title, description }: TabPlaceholderProps) => {
    return (
        <div className='tab-placeholder'>
            <div className='tab-placeholder__content'>
                <Text as='h2' size='xl' weight='bold' align='center'>
                    {title}
                </Text>
                <Text as='p' size='m' align='center' className='tab-placeholder__description'>
                    {description || <Localize i18n_default_text='This feature is coming soon.' />}
                </Text>
            </div>
        </div>
    );
};

export default TabPlaceholder;
