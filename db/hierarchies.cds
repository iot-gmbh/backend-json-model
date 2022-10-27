using {iot.planner as my} from './schema';

namespace iot.planner.hierarchies;

@cds.autoexpose
entity CategoriesLevel0 as projection on my.Categories where hierarchyLevel = '0';

@cds.autoexpose
entity CategoriesLevel1 as projection on my.Categories {
  *,
  parent.title as level0Title
} where hierarchyLevel = '1';

@cds.autoexpose
entity CategoriesLevel2 as projection on my.Categories {
  *,
  parent.title        as level1Title,
  parent.parent.title as level0Title
} where hierarchyLevel = '2';

@cds.autoexpose
entity CategoriesLevel3 as projection on my.Categories {
  *,
  parent.title               as level2Title,
  parent.parent.title        as level1Title,
  parent.parent.parent.title as level0Title
} where hierarchyLevel = '3';

entity WorkItems        as
  select from my.WorkItems {
    *,
    hierarchy.level0,
    hierarchy.level0Title,
    hierarchy.level0Alias,
    hierarchy.level1,
    hierarchy.level1Title,
    hierarchy.level1Alias,
    hierarchy.level2,
    hierarchy.level2Title,
    hierarchy.level2Alias,
    hierarchy.level3,
    hierarchy.level3Title,
    hierarchy.level3Alias,
  };

view Hierarchies as
  select from my.Categories {
    key ID,

        case hierarchyLevel
          when
            '0'
          then
            ID
          when
            '1'
          then
            parent.ID
          when
            '2'
          then
            parent.parent.ID
          when
            '3'
          then
            parent.parent.parent.ID
        end as level0        : String,

        case hierarchyLevel
          when
            '1'
          then
            ID
          when
            '2'
          then
            parent.ID
          when
            '3'
          then
            parent.parent.ID
        end as level1        : String,

        case hierarchyLevel
          when
            '2'
          then
            ID
          when
            '3'
          then
            parent.ID
        end as level2        : String,

        case hierarchyLevel
          when
            '3'
          then
            ID
        end as level3        : String,

        // texts
        case hierarchyLevel
          when
            '0'
          then
            title
          when
            '1'
          then
            parent.title
          when
            '2'
          then
            parent.parent.title
          when
            '3'
          then
            parent.parent.parent.title
        end as level0Title   : String,

        case hierarchyLevel
          when
            '1'
          then
            title
          when
            '2'
          then
            parent.title
          when
            '3'
          then
            parent.parent.title
        end as level1Title   : String,

        case hierarchyLevel
          when
            '2'
          then
            title
          when
            '3'
          then
            parent.title
        end as level2Title   : String,

        case hierarchyLevel
          when
            '3'
          then
            title
        end as level3Title   : String,


        // mapping-title's
        case hierarchyLevel
          when
            '0'
          then
            mappingID
          when
            '1'
          then
            parent.mappingID
          when
            '2'
          then
            parent.parent.mappingID
          when
            '3'
          then
            parent.parent.parent.mappingID
        end as level0Alias   : String,

        case hierarchyLevel
          when
            '1'
          then
            mappingID
          when
            '2'
          then
            parent.mappingID
          when
            '3'
          then
            parent.parent.mappingID
        end as level1Alias   : String,
        case hierarchyLevel
          when
            '2'
          then
            mappingID
          when
            '3'
          then
            parent.mappingID
        end as level2Alias   : String,

        case hierarchyLevel
          when
            '3'
          then
            mappingID
        end as level3Alias   : String,

        // manager
        case hierarchyLevel
          when
            '0'
          then
            manager.userPrincipalName
          when
            '1'
          then
            parent.manager.userPrincipalName
          when
            '2'
          then
            parent.parent.manager.userPrincipalName
          when
            '3'
          then
            parent.parent.parent.manager.userPrincipalName
        end as level0Manager : String,

        case hierarchyLevel
          when
            '1'
          then
            manager.userPrincipalName
          when
            '2'
          then
            parent.manager.userPrincipalName
          when
            '3'
          then
            parent.parent.manager.userPrincipalName
        end as level1Manager : String,

        case hierarchyLevel
          when
            '2'
          then
            manager.userPrincipalName
          when
            '3'
          then
            parent.manager.userPrincipalName
        end as level2Manager : String,

        case hierarchyLevel
          when
            '3'
          then
            manager.userPrincipalName
        end as level3Manager : String,
  };
