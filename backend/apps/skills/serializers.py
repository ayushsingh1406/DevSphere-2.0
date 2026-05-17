from rest_framework import serializers

from .models import Skill, UserSkill


class SkillSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skill

        fields = [
            "id",
            "name",
            "description",
            "category",
        ]


class UserSkillSerializer(serializers.ModelSerializer):

    skill_name = serializers.CharField(required=False)
    description = serializers.CharField(required=False, write_only=True, allow_blank=True)
    category = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = UserSkill

        fields = [
            "id",
            "skill",
            "skill_name",
            "proficiency",
            "years_of_experience",
            "projects_completed",
            "hours_practiced",
            "description",
            "category",
            "started_learning_date",
        ]
        extra_kwargs = {
            'skill': {'required': False, 'allow_null': True},
            'proficiency': {'read_only': True}
        }

    def create(self, validated_data):
        user = self.context["request"].user
        skill_name = validated_data.pop("skill_name", None)
        skill_id = validated_data.pop("skill", None)
        description = validated_data.pop("description", None)
        category = validated_data.pop("category", None)

        if skill_name:
            skill_name_clean = skill_name.strip()
            skill = Skill.objects.filter(name__iexact=skill_name_clean).first()
            if not skill:
                skill = Skill.objects.create(name=skill_name_clean)
        elif skill_id:
            skill = skill_id
        else:
            raise serializers.ValidationError("Either skill ID or skill_name is required.")

        # Update Master Skill details if provided
        if description:
            skill.description = description
        if category:
            skill.category = category
        if description or category:
            skill.save()

        # CLEAN UP validated_data to prevent null overrides of foreign keys
        update_data = {k: v for k, v in validated_data.items() if v is not None}

        instance, created = UserSkill.objects.update_or_create(
            user=user,
            skill=skill,
            defaults=update_data
        )
        
        return instance

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['skill_name'] = instance.skill.name
        rep['description'] = instance.skill.description
        rep['category'] = instance.skill.category
        return rep