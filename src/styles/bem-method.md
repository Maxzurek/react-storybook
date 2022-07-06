```jsx
import './Header.css';
import classNames from 'classnames';

function Header(props) {
    const { children, outline, primary } = props;

    const headerBouton = classNames('header__bouton', {
        'header__bouton--outline': outline && !primary,
        'header__bouton--outline-primary': outline && primary,
        'header__bouton--primary': !outline && primary,
    });

    ...

    return(
        <div className={}>
    )

    return (<Header className={classes}>{children}</Header>);
}
```
