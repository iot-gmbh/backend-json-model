using {iot.planner as my} from './schema';

namespace iot.planner.hierarchies;

view Hierarchies as
  select from my.Categories as parent
  left outer join my.Categories as grandParent
    on parent.parent.ID = grandParent.ID
  left outer join my.Categories as greatGrandParent
    on grandParent.parent.ID = greatGrandParent.ID
  left outer join my.Categories as greatGreatGrandParent
    on greatGrandParent.parent.ID = greatGreatGrandParent.ID
  {
    key parent.ID as parent,
        case parent.hierarchyLevel
          when
            0
          then
            parent.ID
          when
            1
          then
            grandParent.ID
          when
            2
          then
            greatGrandParent.ID
          else
            greatGreatGrandParent.ID
        end       as level0          : String,
        case parent.hierarchyLevel
          when
            0
          then
            parent.mappingID
          when
            1
          then
            grandParent.mappingID
          when
            2
          then
            greatGrandParent.mappingID
          else
            greatGreatGrandParent.mappingID
        end       as level0MappingID : String,
        case parent.hierarchyLevel
          when
            1
          then
            parent.ID
          when
            2
          then
            grandParent.ID
          when
            3
          then
            greatGrandParent.ID
          else
            greatGreatGrandParent.ID
        end       as level1          : String,
        case parent.hierarchyLevel
          when
            1
          then
            parent.mappingID
          when
            2
          then
            grandParent.mappingID
          when
            3
          then
            greatGrandParent.mappingID
          else
            greatGreatGrandParent.mappingID
        end       as level1MappingID : String,
        case parent.hierarchyLevel
          when
            2
          then
            parent.ID
          when
            3
          then
            grandParent.ID
          else
            greatGrandParent.ID
        end       as level2          : String,
        case parent.hierarchyLevel
          when
            2
          then
            parent.mappingID
          when
            3
          then
            grandParent.mappingID
          else
            greatGrandParent.mappingID
        end       as level2MappingID : String,
        case parent.hierarchyLevel
          when
            3
          then
            parent.ID
          else
            grandParent.ID
        end       as level3          : String,
        case parent.hierarchyLevel
          when
            3
          then
            parent.mappingID
          else
            grandParent.mappingID
        end       as level3MappingID : String,
  };
