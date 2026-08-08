'use client';

import { Suspense } from 'react';
import ChooseRoleForm from './ChooseRoleForm';

export default function ChooseRolePage() {
  return (
    <Suspense>
      <ChooseRoleForm />
    </Suspense>
  );
}
