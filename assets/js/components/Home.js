// ./assets/js/components/Home.js

import React, {Component} from 'react';
import {Route, Redirect, Switch, Link} from 'react-router-dom';
import SetupCheck from "./SetupCheck";
import CurrencyDashboard from "./CurrencyDashboard";

class Home extends Component {

    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <Link className={"navbar-brand"} to={"#"}> Telemedi Zadanko </Link>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item">
                                <Link className={"nav-link"} to={"/dashboard"}> Currency Dashboard </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={"nav-link"} to={"/setup-check"}> React Setup Check </Link>
                            </li>

                        </ul>
                    </div>
                </nav>
                <Switch>
                    <Redirect exact from="/" to="/dashboard" />
                    <Route path="/dashboard" component={CurrencyDashboard} />
                    <Route path="/setup-check" component={SetupCheck} />
                </Switch>
            </div>
        )
    }
}

export default Home;
