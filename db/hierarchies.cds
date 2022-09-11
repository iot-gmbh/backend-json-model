using {iot.planner as my} from './schema';

namespace iot.planner.hierarchies;

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
        end as level0          : String,

        // case hierarchyLevel
        //   when
        //     '1'
        //   then
        //     parent.ID
        //   when
        //     '2'
        //   then
        //     parent.parent.ID
        //   when
        //     '2'
        //   then
        //     parent.parent.parent.ID
        //   when
        //     '3'
        //   then
        //     parent.parent.parent.parent.ID
        // end as level1          : String,

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
        end as level1          : String,
        case hierarchyLevel
          when
            '2'
          then
            ID
          when
            '3'
          then
            parent.ID
        end as level2          : String,
        case hierarchyLevel
          when
            '3'
          then
            ID
        end as level3          : String,

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
        end as level0Title     : String,
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
        end as level1Title     : String,
        case hierarchyLevel
          when
            '2'
          then
            title
          when
            '3'
          then
            parent.title
        end as level2Title     : String,
        case hierarchyLevel
          when
            '3'
          then
            title
        end as level3Title     : String,

        // mapping-ID's
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
        end as level0MappingID : String,
        case hierarchyLevel
          when
            '1'
          then
            mappingID
          when
            '2'
          then
            parent.parent.mappingID
          when
            '3'
          then
            parent.parent.mappingID
        end as level1MappingID : String,
        case hierarchyLevel
          when
            '2'
          then
            mappingID
          when
            '3'
          then
            parent.mappingID
        end as level2MappingID : String,
        case hierarchyLevel
          when
            '3'
          then
            mappingID
        end as level3MappingID : String,
  };
