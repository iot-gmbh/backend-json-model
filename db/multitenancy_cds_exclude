using {iot.planner as my} from './schema';

annotate my.Categories with @(restrict : [
  {
    grant : [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to    : 'authenticated-user',
    where : 'tenant = $user.tenant'
  },
  {
    grant : 'CREATE',
    to    : 'authenticated-user'
  }
]);

annotate my.CategoryLevels with @(restrict : [
  {
    grant : [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to    : 'authenticated-user',
    where : 'tenant = $user.tenant'
  },
  {
    grant : 'CREATE',
    to    : 'authenticated-user'
  },
]);

annotate my.MatchCategory2WorkItem with @(restrict : [
  {
    grant : [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to    : 'authenticated-user',
    where : 'tenant = $user.tenant'
  },
  {
    grant : 'CREATE',
    to    : 'authenticated-user'
  }
]);

annotate my.Tags with @(restrict : [
  {
    grant : [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to    : 'authenticated-user',
    where : 'tenant = $user.tenant'
  },
  {
    grant : 'CREATE',
    to    : 'authenticated-user'
  }
]);

annotate my.Tags2Categories with @(restrict : [
  {
    grant : [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to    : 'authenticated-user',
    where : 'tenant = $user.tenant'
  },
  {
    grant : 'CREATE',
    to    : 'authenticated-user'
  }
]);

annotate my.Travels with @(restrict : [
  {
    grant : [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to    : 'authenticated-user',
    where : 'tenant = $user.tenant'
  },
  {
    grant : 'CREATE',
    to    : 'authenticated-user'
  }
]);

annotate my.Users with @(restrict : [
  {
    grant : [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to    : 'authenticated-user',
    where : 'tenant = $user.tenant'
  },
  {
    grant : 'CREATE',
    to    : 'authenticated-user'
  }
]);

annotate my.Users2Categories with @(restrict : [
  {
    grant : [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to    : 'authenticated-user',
    where : 'tenant = $user.tenant'
  },
  {
    grant : 'CREATE',
    to    : 'authenticated-user'
  }
]);

annotate my.WorkItems with @(restrict : [
  {
    grant : [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to    : 'authenticated-user',
    where : 'tenant = $user.tenant'
  },
  {
    grant : 'CREATE',
    to    : 'authenticated-user'
  }
]);
