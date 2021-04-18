import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export const Copyright = () => (
    <Typography variant='body2' color='textSecondary' align='center'>
        {'Copyright © '}
        <Link color='inherit' href='https://material-ui.com/'>
            Your Website
        </Link>{' '}
        <span data-id='copyrightYear'>{new Date().getFullYear()}</span>
        {'.'}
    </Typography>
);
