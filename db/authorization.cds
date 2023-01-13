using {iot.planner as my} from './schema';

annotate my.Categories with @(restrict: [
  {
    grant: 'CREATE',
    to   : 'admin'
  },
  {
    grant: [
      'UPDATE',
      'DELETE'
    ],
    to   : 'admin',
    where: 'tenant = $user.tenant',
  },
  {
    grant: 'READ',
    to   : 'authenticated-user',
    where: 'tenant = $user.tenant',
  }
]);

annotate my.CategoryLevels with @(restrict: [
  {
    grant: 'CREATE',
    to   : 'admin'
  },
  {
    grant: [
      'UPDATE',
      'DELETE'
    ],
    to   : 'admin',
    where: 'tenant = $user.tenant',
  },
  {
    grant: 'READ',
    to   : 'authenticated-user',
    where: 'tenant = $user.tenant',
  }
]);

annotate my.Tags2Categories with @(restrict: [
  {
    grant: 'CREATE',
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'authenticated-user',
    where: 'tenant = $user.tenant'
  },
]);


annotate my.Users with @(restrict: [
  {
    grant: 'CREATE',
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'admin',
    where: 'tenant = $user.tenant',
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'authenticated-user',
    where: 'tenant = $user.tenant and (userPrincipalName = $user or manager_userPrincipalName = $user)'
  },
]);

annotate my.Users2Categories with @(restrict: [
  {
    grant: 'CREATE',
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'admin',
    where: 'tenant = $user.tenant',
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'authenticated-user',
    where: 'tenant = $user.tenant and user_userPrincipalName = $user'
  }
]);

annotate my.WorkItems with @(restrict: [
  {
    grant: 'CREATE',
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'admin',
    where: 'tenant = $user.tenant',
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'authenticated-user',
    where: 'tenant = $user.tenant and userPrincipalName = $user'
  }
]);

annotate my.Travels with @(restrict: [
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'admin',
    where: 'tenant = $user.tenant',
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'authenticated-user',
    where: 'tenant = $user.tenant and userPrincipalName = $user'
  },
  {
    grant: 'CREATE',
    to   : 'authenticated-user'
  },
]);

annotate my.Tags with @(restrict: [
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'authenticated-user',
    where: 'tenant = $user.tenant'
  },
  {
    grant: 'CREATE',
    to   : 'authenticated-user'
  }
]);
