import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { DALPanel } from './DALPanel';

export class DALWidget extends ReactWidget {
  constructor() {
    super();
    this.addClass('dal-widget');
  }

  render(): JSX.Element {
    return <DALPanel />;
  }
} 